"use client";

import { useEffect, useState } from "react";
import { AdminApi, type AdminResidentRow } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function AdminResidentsPage() {
  useAuthGuard("admin");

  const [items, setItems] = useState<AdminResidentRow[]>([]);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [actionErr, setActionErr] = useState<string | null>(null);

  async function load() {
    setState({ status: "loading" });
    try {
      const data = await AdminApi.listResidents();
      setItems(data);
      setState({ status: "done" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setState({ status: "error", message: msg });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function disable(id: string) {
    setActionErr(null);
    try {
      await AdminApi.disableResident(id);
      await load();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Disable failed");
    }
  }

  async function enable(id: string) {
    setActionErr(null);
    try {
      await AdminApi.enableResident(id);
      await load();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Enable failed");
    }
  }

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Admin • Resident Management</h2>
        <p className="subtitle">Manage residents: enable/disable access.</p>
      </header>

      {actionErr ? (
        <p className="alert alertError" role="alert">
          {actionErr}
        </p>
      ) : null}

      {state.status === "loading" ? <p className="subtitle">Loading…</p> : null}

      {state.status === "error" ? (
        <p className="alert alertError" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === "done" ? (
        <section className="card panel vStack">
          {items.length === 0 ? (
            <p className="subtitle">No residents found.</p>
          ) : (
            <table className="table" aria-label="Residents table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit</th>
                  <th>Contact</th>
                  <th>Status</th>
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
                    <td>{r.email || r.phone || "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "active"
                            ? "badgeSuccess"
                            : r.status === "disabled"
                              ? "badgeDanger"
                              : ""
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {r.status === "disabled" ? (
                        <button className="btn btnPrimary" onClick={() => enable(r.id)}>
                          Enable
                        </button>
                      ) : (
                        <button className="btn btnDanger" onClick={() => disable(r.id)}>
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </div>
  );
}
