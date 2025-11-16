"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

type User = { id: string; email: string } | null;

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    // per-mount guard
    let tried = false;

    // dev/HMR global guard (prevents double attempts during hot reload)
    const devGuardKey = "__APP_REFRESH_TRIED__";
    if (process.env.NODE_ENV === "development") {
      // @ts-ignore
      if ((globalThis as any)[devGuardKey]) {
        tried = true;
      }
    }

    async function init() {
      if (tried) return;
      tried = true;
      if (process.env.NODE_ENV === "development") {
        // @ts-ignore
        (globalThis as any)[devGuardKey] = true;
      }

      try {
        // attempt silent refresh using cookie (server returns 401 if no session)
        const res = await api.post("/auth/refresh");
        const token = res?.data?.accessToken ?? null;
        if (!token) {
          if (mounted) {
            setAccessToken(null);
            setUser(null);
          }
          return;
        }

        if (mounted) {
          setAccessToken(token);
          const payload = parseJwt(token);
          setUser({ id: payload.userId, email: payload.email });
        }
      } catch (err: any) {
        // Expected: 401 -> no session. Silently ignore.
        // Only log unexpected errors (network, 5xx, CORS)
        const status = err?.response?.status;
        if (status && status !== 401) {
          // you can send to a monitoring service instead of console
          // console.error("Refresh error", err);
        }
        if (mounted) {
          setAccessToken(null);
          setUser(null);
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    api.setAccessToken(accessToken);
  }, [accessToken]);

  async function login(email: string, password: string) {
    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      // server returns accessToken and sets refresh cookie
      const access = res.data.accessToken;
      setAccessToken(access);
      const payload = parseJwt(access);
      setUser({ id: payload.userId, email: payload.email });
      return; // success
    } catch (err: any) {
      // normalize axios / network errors into a readable Error
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        err?.message ||
        "Login failed";
      throw new Error(serverMessage);
    }
  }

  async function register(email: string, password: string) {
    await api.post("/auth/register", { email, password });
  }

  async function logout() {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function parseJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return {};
  }
}
