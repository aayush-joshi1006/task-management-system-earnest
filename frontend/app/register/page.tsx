"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const emailTrimmed = email.trim();
    const emailValid = /^[\w.-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(
      emailTrimmed
    );

    // client-side validation (same rules as server)
    if (!emailTrimmed || !emailValid) {
      const msg = "Please enter a valid email address";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!password) {
      const msg = "Password required";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await register(emailTrimmed, password);
      toast.success("Account created. Please login.");
      router.push("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Register failed";
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
          aria-labelledby="register-heading"
        >
          <h2
            id="register-heading"
            className="text-2xl font-semibold text-slate-800 mb-2"
          >
            Create an account
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Start managing your tasks — it only takes a minute.
          </p>

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
              className="mt-2 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </label>

          <label className="block mb-4 text-sm text-slate-700">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              aria-required
              className="mt-2 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            <div className="mt-2 text-xs text-slate-400">
              Use at least 6 characters. Avoid common passwords.
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white ${
              loading
                ? "bg-green-400 cursor-wait"
                : "bg-green-600 hover:bg-green-700"
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>

          <div className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </a>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          By creating an account you agree to our terms of service.
        </div>
      </div>
    </div>
  );
}
