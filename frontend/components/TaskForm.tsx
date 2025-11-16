"use client";
import React, { useState } from "react";
import api from "../lib/api";
import { toast } from "react-toastify";

export default function TaskForm({ onAdded }: { onAdded?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!title.trim()) {
      toast.error("Title is required");
      setLoading(false);
      return;
    }

    try {
      await api.post("/tasks", { title: title.trim(), description });
      toast.success("Task added successfully");

      setTitle("");
      setDescription("");

      // If parent wants to refresh list without reload
      if (onAdded) onAdded();

      // Or fallback: reload page (not recommended)
      // window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add task");
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-slate-200 shadow-sm rounded-xl p-4"
    >
      <h3 className="font-semibold text-slate-800 mb-3 text-lg">Create Task</h3>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-slate-600">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          className="w-full p-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-slate-600">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="w-full p-2 rounded-lg border text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <button
        disabled={loading}
        className={`w-full py-2 rounded-lg text-white font-medium transition ${
          loading
            ? "bg-indigo-300 cursor-wait"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}
