"use client";
import React, { useState } from "react";
import api from "../lib/api";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tasks", { title, description });
      setTitle("");
      setDescription("");
      // naive local refresh: reload page
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <h3 className="font-medium mb-2">New Task</h3>
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 border rounded mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full p-2 border rounded mb-2"
      />
      <button
        className="w-full py-2 bg-indigo-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}
