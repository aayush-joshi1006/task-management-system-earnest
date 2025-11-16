"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/useAuth";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";

export default function Page() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  if (!user)
    return (
      <div className="p-6">
        You must login.{" "}
        <a href="/login" className="text-blue-600">
          Login
        </a>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-600">{user.email}</span>
          <button
            onClick={() => logout()}
            className="px-3 py-1 rounded bg-red-500 text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="flex gap-2 mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title..."
              className="flex-1 p-2 border rounded"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <TaskList q={query} status={status} />
        </div>

        <div>
          <TaskForm />
        </div>
      </section>
    </div>
  );
}
