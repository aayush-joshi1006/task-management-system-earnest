"use client";
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./useAuth";

export default function TaskList({
  q,
  status,
}: {
  q?: string;
  status?: string;
}) {
  const {} = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [q, status, page]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/tasks", {
        params: { q, status, page, perPage: 10 },
      });
      setTasks(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function toggle(id: string) {
    await api.post(`/tasks/${id}/toggle`);
    load();
  }

  async function del(id: string) {
    await api.delete(`/tasks/${id}`);
    load();
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {tasks.length === 0 ? (
            <div className="text-sm text-slate-500">No tasks</div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="p-3 border-b flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-slate-500">{t.description}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggle(t.id)}
                    className="px-2 py-1 rounded bg-blue-600 text-white text-sm"
                  >
                    {t.status === "completed" ? "Undo" : "Done"}
                  </button>
                  <button
                    onClick={() => del(t.id)}
                    className="px-2 py-1 rounded bg-red-500 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {meta && (
            <div className="mt-3 flex justify-between text-sm text-slate-600">
              <div>
                Page {meta.page} / {meta.pages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 border rounded"
                >
                  Prev
                </button>
                <button
                  disabled={meta.page >= meta.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 border rounded"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
