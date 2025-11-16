"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(email, password);
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Register failed");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-[420px] p-6 bg-white rounded shadow">
        <h2 className="text-xl mb-4">Register</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password (min 6)"
          className="w-full p-2 border rounded mb-4"
        />
        <button className="w-full py-2 bg-green-600 text-white rounded">
          Register
        </button>
        <div className="mt-3 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600">
            Login
          </a>
        </div>
      </form>
    </div>
  );
}
