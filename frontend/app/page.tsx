"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { toast } from "react-toastify";

export default function Page() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // debounce query updates (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // derive user initials for avatar
  const initials = useMemo(() => {
    if (!user?.email) return "U";
    const namePart = user.email.split("@")[0];
    const parts = namePart.split(/[\._\-]/).filter(Boolean);
    const first = parts[0]?.[0]?.toUpperCase() ?? "";
    const second = parts[1]?.[0]?.toUpperCase() ?? "";
    return first + second || first || "U";
  }, [user]);

  async function handleLogout() {
    if (!confirm("Are you sure you want to logout?")) return;
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out");
    } catch (err: any) {
      console.error("Logout failed", err);
      toast.error(err?.message || "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-md w-full text-center">
          <h2 className="text-lg font-semibold mb-2">You must be signed in</h2>
          <p className="text-sm text-slate-500 mb-4">
            Please sign in to view and manage your tasks.
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to login
          </a>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Tasks</h1>
                <div className="text-sm text-slate-500">{user?.email}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`px-3 py-2 rounded-lg text-white ${
                loggingOut
                  ? "bg-red-300 cursor-wait"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 mb-4">
              <div className="flex gap-3 items-center">
                <div className="flex-1 flex gap-2">
                  <label htmlFor="search" className="sr-only">
                    Search tasks
                  </label>
                  <div className="relative flex-1">
                    <input
                      id="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search title..."
                      className="w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200"
                      aria-label="Search tasks by title"
                    />
                    <svg
                      className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m0 0A7 7 0 1110.65 6.65a7 7 0 016.999 10.999z"
                      />
                    </svg>
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200"
                    aria-label="Filter by status"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setQuery("");
                      setStatus("");
                      toast.info("Filters reset");
                    }}
                    className="px-3 py-2 rounded-lg border hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <TaskList
              q={debouncedQuery}
              status={status}
              reloadKey={refreshKey}
            />
          </div>

          <aside>
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
              <h2 className="text-lg font-medium text-slate-800 mb-3">
                Add Task
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Quickly add a new task to your list.
              </p>
              <TaskForm onAdded={() => setRefreshKey((k) => k + 1)} />
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
