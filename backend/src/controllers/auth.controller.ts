import { Request, Response } from "express";
import prisma from "../prismaClient";
import bcrypt from "bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const REFRESH_COOKIE_NAME = "jid";
const isProd = process.env.NODE_ENV === "production";

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    // store refresh token server-side (optional, increases control)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // send refresh token as httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProd, // true in prod, false in dev
      sameSite: isProd ? "none" : "lax", // none+secure for cross-site prod; lax for dev
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (client-side fallback)
    });
    console.log("Login -> Set-Cookie header:", res.getHeader("Set-Cookie"));
    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];

    // 1) No cookie -> harmless response (no session)
    if (!token) {
      return res.status(200).json({ accessToken: null });
    }

    // 2) Try to verify token and find the user
    let decoded: any;
    try {
      decoded = verifyRefreshToken(token) as any;
    } catch (verifyErr: any) {
      // token invalid or expired -> clear cookie and return no-session
      console.debug(
        "Refresh token verify failed:",
        verifyErr?.message ?? verifyErr
      );
      // clear client cookie (path + httpOnly + same flags)
      res.cookie(REFRESH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 0,
      });
      return res.status(200).json({ accessToken: null });
    }

    const userId = decoded.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 3) No user or mismatch -> clear cookie and return no-session
    if (!user || user.refreshToken !== token) {
      console.debug("Refresh no user or token mismatch for userId:", userId);
      res.cookie(REFRESH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 0,
      });
      return res.status(200).json({ accessToken: null });
    }

    // 4) All good -> issue new tokens and rotate
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (err: any) {
    // unexpected server error -> log and return 500
    console.error("Refresh handler error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (token) {
      // try to decode, but we primarily remove server-side stored token
      try {
        const decoded = verifyRefreshToken(token) as any;
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refreshToken: null },
        });
      } catch {}
    }

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
