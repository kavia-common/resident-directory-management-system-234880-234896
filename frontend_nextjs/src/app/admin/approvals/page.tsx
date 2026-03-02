"use client";

import { useEffect, useState } from "react";
import { AdminApi, type AdminPendingResident } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function AdminApprovalsPage() {
  useAuthGuard("admin");

  const [items, setItems] = useState<AdminPendingResident[]>([]);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [actionErr, setActionErr] = useState<string | null>(null);

  async function load() {
    setState({ status: "loading" });
    try {
      const data = await AdminApi.listPendingResidents();
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

  async function approve(id: string) {
    setActionErr(null);
    try {
      await AdminApi.approveResident(id);
      await load();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Approve failed");
    }
  }

  async function reject(id: string) {
    setActionErr(null);
    try {
      await AdminApi.rejectResident(id);
      await load();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Reject failed");
    }
  }

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Admin • Approvals</h2>
        <p className="subtitle">Approve or reject new resident registrations.</p>
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
            <p className="subtitle">No pending registrations.</p>
          ) : (
            <table className="table" aria-label="Pending registrations">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Unit</th>
                  <th>Contact</th>
                  <th>Requested</th>
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
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="btnRow" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btnPrimary" onClick={() => approve(r.id)}>
                          Approve
                        </button>
                        <button className="btn btnDanger" onClick={() => reject(r.id)}>
                          Reject
                        </button>
                      </div>
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
