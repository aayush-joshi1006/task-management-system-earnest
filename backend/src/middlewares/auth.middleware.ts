// import { Request, Response, NextFunction } from "express";
// import { verifyAccessToken } from "../utils/jwt";
// import z from "zod";

// export interface AuthRequest extends Request {
//   user?: { id: string; email?: string };
// }

// export function requireAuth(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   const auth = req.headers.authorization;
//   if (!auth || !auth.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   const token = auth.split(" ")[1];
//   try {
//     const payload = verifyAccessToken(token) as any;
//     req.user = { id: payload.userId, email: payload.email };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// }

// export function validate(schema: z.ZodSchema<any>) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       schema.parse(req.body);
//       next();
//     } catch (err: any) {
//       return res.status(400).json({
//         message:
//           err.errors?.map((e: any) => e.message).join(", ") || "Invalid input",
//       });
//     }
//   };
// }

// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt"; // your verify function
import { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; email?: string };
}

/** Extract access token from header or (optional) access_token cookie */
function extractAccessToken(req: Request): string | null {
  // 1) Authorization header: "Bearer <token>"
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.split(" ")[1];

  // 2) Cookie fallback: only check a dedicated access_token cookie (NOT refresh token)
  // Requires cookie-parser middleware earlier in the stack: app.use(cookieParser());
  const anyReq = req as any;
  if (anyReq?.cookies && typeof anyReq.cookies.access_token === "string") {
    return anyReq.cookies.access_token;
  }

  return null;
}

/** Middleware to require a valid access token */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractAccessToken(req);

  if (!token) {
    // Helpful debug info when testing — remove or lower verbosity in production
    console.debug(
      "Auth failed: no token found. Authorization header:",
      req.headers.authorization,
      "Cookies:",
      (req as any).cookies
    );
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyAccessToken(token) as JwtPayload & {
      userId?: string;
      email?: string;
    };

    if (!payload || !payload.userId) {
      console.debug("Auth failed: token payload invalid", payload);
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { id: String(payload.userId), email: payload.email };
    next();
  } catch (err) {
    console.debug("Auth failed: token verify error", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Zod validation middleware (kept typed) */
import z from "zod";
export function validate(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(400).json({
        message:
          err.errors?.map((e: any) => e.message).join(", ") || "Invalid input",
      });
    }
  };
}
