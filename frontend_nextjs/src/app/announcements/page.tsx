"use client";

import { useEffect, useState } from "react";
import { AnnouncementsApi, type Announcement } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function AnnouncementsPage() {
  useAuthGuard("resident");

  const [items, setItems] = useState<Announcement[]>([]);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading" });
      try {
        const data = await AnnouncementsApi.list();
        if (!cancelled) {
          setItems(data);
          setState({ status: "done" });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setState({ status: "error", message: msg });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Announcements</h2>
        <p className="subtitle">Updates broadcast by community administrators.</p>
      </header>

      {state.status === "loading" ? <p className="subtitle">Loading…</p> : null}

      {state.status === "error" ? (
        <p className="alert alertError" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === "done" ? (
        <section className="card panel vStack" aria-label="Announcements list">
          {items.length === 0 ? (
            <p className="subtitle">No announcements yet.</p>
          ) : (
            <ul className="vStack">
              {items.map((a) => (
                <li key={a.id} className="card panel">
                  <div className="hStack" style={{ justifyContent: "space-between" }}>
                    <strong>{a.title}</strong>
                    <span className="label">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ marginTop: 8 }}>{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
