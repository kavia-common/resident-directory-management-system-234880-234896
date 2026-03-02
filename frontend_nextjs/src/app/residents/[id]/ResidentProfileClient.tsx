"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DirectoryApi, type ResidentProfile } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function ResidentProfileClient({
  residentId,
}: {
  residentId: string;
}) {
  useAuthGuard("resident");

  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!residentId) return;
      setState({ status: "loading" });
      try {
        const data = await DirectoryApi.getResident(String(residentId));
        if (!cancelled) {
          setProfile(data);
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
  }, [residentId]);

  return (
    <div className="vStack">
      <header className="hStack" style={{ justifyContent: "space-between" }}>
        <div className="vStack" style={{ gap: 4 }}>
          <h2 className="title">Resident Profile</h2>
          <p className="subtitle">Details shown respect the resident’s privacy settings.</p>
        </div>
        <Link className="btn" href="/">
          ← Back
        </Link>
      </header>

      {state.status === "loading" ? <p className="subtitle">Loading…</p> : null}

      {state.status === "error" ? (
        <p className="alert alertError" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === "done" && profile ? (
        <section className="card panel vStack" aria-label="Resident details">
          <div className="hStack" style={{ justifyContent: "space-between" }}>
            <div className="vStack" style={{ gap: 4 }}>
              <strong style={{ fontSize: 18 }}>{profile.name}</strong>
              <span className="subtitle">
                Unit {profile.unitNumber}
                {profile.building ? ` • ${profile.building}` : ""}{" "}
                {profile.floor ? `• Floor ${profile.floor}` : ""}
              </span>
            </div>
            <span className="badge">ID: {profile.id}</span>
          </div>

          <hr className="hr" />

          <div className="grid2">
            <div className="vStack">
              <span className="label">Email</span>
              <span>{profile.email || "Hidden / not shared"}</span>
            </div>
            <div className="vStack">
              <span className="label">Phone</span>
              <span>{profile.phone || "Hidden / not shared"}</span>
            </div>
            <div className="vStack">
              <span className="label">Family members</span>
              <span>{profile.familyMembers || "—"}</span>
            </div>
            <div className="vStack">
              <span className="label">Vehicle details</span>
              <span>{profile.vehicleDetails || "—"}</span>
            </div>
            <div className="vStack">
              <span className="label">Emergency contact</span>
              <span>{profile.emergencyContact || "—"}</span>
            </div>
            <div className="vStack">
              <span className="label">Interests</span>
              <span>{profile.interests || "—"}</span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
