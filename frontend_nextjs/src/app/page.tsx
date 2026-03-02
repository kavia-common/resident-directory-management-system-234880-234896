"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DirectoryApi, type ResidentDirectoryItem } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function DirectoryPage() {
  const user = useMemo(() => getSessionUser(), []);

  const [q, setQ] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [interest, setInterest] = useState("");

  const [items, setItems] = useState<ResidentDirectoryItem[]>([]);
  const [state, setState] = useState<LoadState>({ status: "idle" });

  async function runSearch() {
    setState({ status: "loading" });
    try {
      const data = await DirectoryApi.search({
        q: q || undefined,
        building: building || undefined,
        floor: floor || undefined,
        interest: interest || undefined,
      });
      setItems(data);
      setState({ status: "done" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setState({ status: "error", message: msg });
    }
  }

  useEffect(() => {
    // initial load
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canViewDirectory = Boolean(user); // PRD implies directory is for authenticated residents

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Directory</h2>
        <p className="subtitle">
          Search by name or unit number. Filter by building, floor, or interests.
        </p>
      </header>

      {!canViewDirectory ? (
        <section className="alert alertInfo" role="status">
          <div className="vStack" style={{ gap: 6 }}>
            <strong>Login required</strong>
            <span className="subtitle">
              For privacy reasons, the directory is available to authenticated residents only.
            </span>
            <div className="btnRow">
              <Link className="btn btnPrimary" href="/auth/login">
                Go to Login
              </Link>
              <Link className="btn" href="/auth/register">
                Create account
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="card panel" aria-label="Directory search and filters">
            <div className="grid2">
              <div className="field">
                <label className="label" htmlFor="q">
                  Search
                </label>
                <input
                  id="q"
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Name or unit #"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="interest">
                  Interest (optional)
                </label>
                <input
                  id="interest"
                  className="input"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="e.g., tennis, gardening"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="building">
                  Building/Block
                </label>
                <input
                  id="building"
                  className="input"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g., A, B, Tower 1"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="floor">
                  Floor
                </label>
                <input
                  id="floor"
                  className="input"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g., 3"
                />
              </div>
            </div>

            <div className="btnRow" style={{ marginTop: 12 }}>
              <button
                className="btn btnPrimary"
                onClick={runSearch}
                disabled={state.status === "loading"}
              >
                {state.status === "loading" ? "Searching…" : "Search"}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setQ("");
                  setBuilding("");
                  setFloor("");
                  setInterest("");
                  setTimeout(() => void runSearch(), 0);
                }}
                disabled={state.status === "loading"}
              >
                Reset
              </button>
            </div>

            {state.status === "error" ? (
              <p className="alert alertError" role="alert" style={{ marginTop: 12 }}>
                {state.message}
              </p>
            ) : null}
          </section>

          <section className="vStack" aria-label="Directory results">
            <div className="hStack" style={{ justifyContent: "space-between" }}>
              <span className="label">
                {items.length} result{items.length === 1 ? "" : "s"}
              </span>
              <span className="help">Click a resident to view profile (privacy applies).</span>
            </div>

            <div className="card panel">
              {items.length === 0 ? (
                <p className="subtitle">No matches. Try clearing filters.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Unit</th>
                      <th>Building</th>
                      <th>Floor</th>
                      <th>Interests</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                        </td>
                        <td>{r.unitNumber}</td>
                        <td>{r.building || "—"}</td>
                        <td>{r.floor || "—"}</td>
                        <td>{r.interests?.join(", ") || "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <Link className="btn" href={`/residents/${encodeURIComponent(r.id)}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
