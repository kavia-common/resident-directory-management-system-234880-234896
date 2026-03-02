"use client";

import { useEffect, useState } from "react";
import { ProfileApi, type ResidentProfile } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type LoadState =
  | { status: "loading" }
  | { status: "saving" }
  | { status: "error"; message: string }
  | { status: "done" };

function boolToggleLabel(value: boolean) {
  return value ? "Visible" : "Hidden";
}

export default function MyProfilePage() {
  useAuthGuard("resident");

  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading" });
      try {
        const data = await ProfileApi.getMyProfile();
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
  }, []);

  async function onSave() {
    if (!profile) return;
    setSuccessMsg(null);
    setState({ status: "saving" });
    try {
      const updated = await ProfileApi.updateMyProfile({
        name: profile.name,
        unitNumber: profile.unitNumber,
        building: profile.building,
        floor: profile.floor,
        email: profile.email,
        phone: profile.phone,
        familyMembers: profile.familyMembers,
        vehicleDetails: profile.vehicleDetails,
        emergencyContact: profile.emergencyContact,
        interests: profile.interests,
        photoUrl: profile.photoUrl,
        privacy: profile.privacy,
      });
      setProfile(updated);
      setSuccessMsg("Saved.");
      setState({ status: "done" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setState({ status: "error", message: msg });
    }
  }

  if (state.status === "loading") return <p className="subtitle">Loading…</p>;

  if (state.status === "error" && !profile) {
    return (
      <p className="alert alertError" role="alert">
        {state.message}
      </p>
    );
  }

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">My Profile</h2>
        <p className="subtitle">
          Edit your details and choose what other residents can see.
        </p>
      </header>

      {state.status === "error" ? (
        <p className="alert alertError" role="alert">
          {state.message}
        </p>
      ) : null}

      {successMsg ? (
        <p className="alert alertInfo" role="status">
          {successMsg}
        </p>
      ) : null}

      {profile ? (
        <>
          <section className="card panel vStack" aria-label="Profile fields">
            <div className="grid2">
              <div className="field">
                <label className="label" htmlFor="p_name">
                  Name
                </label>
                <input
                  id="p_name"
                  className="input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_unit">
                  Unit number
                </label>
                <input
                  id="p_unit"
                  className="input"
                  value={profile.unitNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, unitNumber: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_building">
                  Building/Block
                </label>
                <input
                  id="p_building"
                  className="input"
                  value={profile.building || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, building: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_floor">
                  Floor
                </label>
                <input
                  id="p_floor"
                  className="input"
                  value={profile.floor || ""}
                  onChange={(e) => setProfile({ ...profile, floor: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_email">
                  Email
                </label>
                <input
                  id="p_email"
                  className="input"
                  value={profile.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_phone">
                  Phone
                </label>
                <input
                  id="p_phone"
                  className="input"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_family">
                  Family members (optional)
                </label>
                <textarea
                  id="p_family"
                  className="textarea"
                  value={profile.familyMembers || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, familyMembers: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_vehicle">
                  Vehicle details (optional)
                </label>
                <textarea
                  id="p_vehicle"
                  className="textarea"
                  value={profile.vehicleDetails || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, vehicleDetails: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_emergency">
                  Emergency contact (optional)
                </label>
                <textarea
                  id="p_emergency"
                  className="textarea"
                  value={profile.emergencyContact || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, emergencyContact: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="p_interests">
                  Interests/hobbies (optional)
                </label>
                <textarea
                  id="p_interests"
                  className="textarea"
                  value={profile.interests || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, interests: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <section className="card panel vStack" aria-label="Privacy controls">
            <div className="hStack" style={{ justifyContent: "space-between" }}>
              <div className="vStack" style={{ gap: 4 }}>
                <h3 className="title" style={{ fontSize: 16 }}>
                  Privacy controls
                </h3>
                <p className="subtitle">
                  Choose what other residents can see. Admins may still access for
                  management.
                </p>
              </div>
              <span className="badge">Resident-visible toggles</span>
            </div>

            <div className="grid2">
              {(
                [
                  ["showEmailToResidents", "Email"],
                  ["showPhoneToResidents", "Phone"],
                  ["showFamilyToResidents", "Family members"],
                  ["showVehicleToResidents", "Vehicle details"],
                  ["showEmergencyToResidents", "Emergency contact"],
                  ["showInterestsToResidents", "Interests"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="card panel">
                  <div className="hStack" style={{ justifyContent: "space-between" }}>
                    <div className="vStack" style={{ gap: 2 }}>
                      <strong>{label}</strong>
                      <span className="subtitle">{boolToggleLabel(profile.privacy[key])}</span>
                    </div>
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          privacy: { ...profile.privacy, [key]: !profile.privacy[key] },
                        })
                      }
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="btnRow">
              <button
                className="btn btnPrimary"
                type="button"
                onClick={onSave}
                disabled={state.status === "saving"}
              >
                {state.status === "saving" ? "Saving…" : "Save changes"}
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
