"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

type User = { id: string; email: string } | null;

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // try to fetch profile on mount using refresh token
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const res = await api.post("/auth/refresh");
        setAccessToken(res.data.accessToken);
        const payload = parseJwt(res.data.accessToken);
        if (mounted) setUser({ id: payload.userId, email: payload.email });
      } catch (err) {
        // not logged in
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // set token into api wrapper
    api.setAccessToken(accessToken);
  }, [accessToken]);

  async function login(email: string, password: string) {
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
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return {};
  }
}
