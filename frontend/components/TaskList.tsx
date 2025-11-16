"use client";
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { toast } from "react-toastify";
import { useAuth } from "./useAuth";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
};

interface Props {
  q?: string;
  status?: string;
  reloadKey?: number;
}

export default function TaskList({ q, status, reloadKey }: Props) {
  // keep to ensure auth guard runs if needed
  useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // per-item action loading (toggle/save/delete)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page, reloadKey]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/tasks", {
        params: { q, status, page, perPage: 10 },
      });
      setTasks(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err: any) {
      console.error("Failed to load tasks", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  // optimistic toggle with safe fallback
  async function toggle(id: string) {
    // optimistic UI
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
    setActionLoading((s) => ({ ...s, [id]: true }));

    try {
      await api.post(`/tasks/${id}/toggle`);
      toast.success("Task updated");
      // re-sync to be sure
      await load();
    } catch (err) {
      console.error("Toggle failed", err);
      toast.error("Failed to update task");
      // revert by reloading
      await load();
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  }

  async function del(id: string) {
    // keep native confirm for simplicity
    const ok = confirm("Are you sure you want to delete this task?");
    if (!ok) return;
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      // remove locally for snappy UX
      setTasks((prev) => prev.filter((t) => t.id !== id));
      // optionally re-load meta
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete task");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  }

  function startEdit(t: Task) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) {
      toast.error("Title required");
      return;
    }

    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      // using PUT as your file used put; change to patch if backend expects PATCH
      await api.put(`/tasks/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      toast.success("Task updated");
      cancelEdit();
      await load();
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update task");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  }

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
      {loading ? (
        <div className="p-6 flex items-center justify-center">
          <svg
            className="animate-spin h-6 w-6 text-slate-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
            />
          </svg>
        </div>
      ) : (
        <>
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No tasks found.
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="p-4 border-b last:border-b-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                {editingId === t.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      aria-label="Edit title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Title"
                    />
                    <textarea
                      aria-label="Edit description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-16"
                      placeholder="Description"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => saveEdit(t.id)}
                        disabled={!!actionLoading[t.id]}
                        className={`px-3 py-1 rounded-lg text-white ${
                          actionLoading[t.id]
                            ? "bg-green-300 cursor-wait"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {actionLoading[t.id] ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 rounded-lg border"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-start md:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 truncate">
                        {t.title}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {t.description}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => toggle(t.id)}
                        disabled={!!actionLoading[t.id]}
                        className={`px-3 py-1 rounded-lg text-white text-sm ${
                          actionLoading[t.id]
                            ? "bg-blue-300 cursor-wait"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        aria-pressed={t.status === "completed"}
                      >
                        {actionLoading[t.id]
                          ? "..."
                          : t.status === "completed"
                          ? "Undo"
                          : "Done"}
                      </button>

                      <button
                        onClick={() => startEdit(t)}
                        className="px-3 py-1 rounded-lg border text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => del(t.id)}
                        disabled={!!actionLoading[t.id]}
                        className={`px-3 py-1 rounded-lg text-white text-sm ${
                          actionLoading[t.id]
                            ? "bg-red-300 cursor-wait"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* pagination */}
          {meta && (
            <div className="p-4 flex items-center justify-between text-sm text-slate-600">
              <div>
                Page {meta.page} / {meta.pages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border rounded-lg"
                >
                  Prev
                </button>
                <button
                  disabled={meta.page >= meta.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded-lg"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
