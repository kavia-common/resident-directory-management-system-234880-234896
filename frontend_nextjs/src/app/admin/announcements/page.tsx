"use client";

import { useState } from "react";
import { AnnouncementsApi } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminAnnouncementComposerPage() {
  useAuthGuard("admin");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!title.trim()) return setErr("Title is required.");
    if (!body.trim()) return setErr("Body is required.");

    setLoading(true);
    try {
      await AnnouncementsApi.create({ title, body });
      setTitle("");
      setBody("");
      setOk("Announcement posted.");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Post failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Admin • Post Announcement</h2>
        <p className="subtitle">Broadcast a message to all residents.</p>
      </header>

      {err ? (
        <p className="alert alertError" role="alert">
          {err}
        </p>
      ) : null}

      {ok ? (
        <p className="alert alertInfo" role="status">
          {ok}
        </p>
      ) : null}

      <form className="vStack" onSubmit={onSubmit}>
        <div className="field">
          <label className="label" htmlFor="t">
            Title
          </label>
          <input
            id="t"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Water shutdown Tuesday 9–11am"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="b">
            Body
          </label>
          <textarea
            id="b"
            className="textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the full announcement…"
          />
        </div>

        <div className="btnRow">
          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
