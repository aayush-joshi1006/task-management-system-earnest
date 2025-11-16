"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // simple client validation (same rules as server)
    const emailValid = /^[\w.-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(
      email.trim()
    );
    if (!email || !emailValid) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password required");
      toast.error("Password required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Logged in — welcome back!");
      router.push("/");
    } catch (err: any) {
      const msg = err?.message ?? "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <form
          onSubmit={submit}
          className="bg-white border border-slate-100 shadow-md rounded-2xl p-6 sm:p-8"
          aria-labelledby="login-heading"
        >
          <h2
            id="login-heading"
            className="text-2xl font-semibold text-slate-800 mb-2"
          >
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Sign in to your account to manage your tasks.
          </p>

          {/* inline error */}
          {error && (
            <div
              role="alert"
              className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded"
            >
              {error}
            </div>
          )}

          <label className="block mb-2 text-sm text-slate-700">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              aria-required
              className="mt-2 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>

          <label className="block mb-4 text-sm text-slate-700">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-required
              className="mt-2 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white ${
              loading
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="mt-4 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create account
            </a>
          </div>
        </form>

        {/* subtle footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to our terms and privacy.
        </div>
      </div>
    </div>
  );
}
