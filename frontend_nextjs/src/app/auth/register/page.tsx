"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApi } from "@/lib/api";
import { setSessionUser, setToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Name is required.");
    if (!unitNumber.trim()) return setErr("Apartment/unit number is required.");
    if (!email.trim() && !phone.trim() && !invitationCode.trim()) {
      return setErr("Provide email, phone, or an invitation code to sign up.");
    }
    if (!password) {
      // PRD: password OR OTP. For registration we allow password; OTP could be future.
      return setErr("Password is required for registration in this flow.");
    }

    setLoading(true);
    try {
      const resp = await AuthApi.register({
        name,
        unitNumber,
        email: email || undefined,
        phone: phone || undefined,
        invitationCode: invitationCode || undefined,
        password,
      });

      setToken(resp.token);
      setSessionUser(resp.user);

      if (resp.approvalStatus === "pending") {
        router.push("/auth/pending");
      } else {
        router.push("/");
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Register</h2>
        <p className="subtitle">
          Create your resident account. Some communities require admin approval.
        </p>
      </header>

      {err ? (
        <p className="alert alertError" role="alert">
          {err}
        </p>
      ) : null}

      <form className="vStack" onSubmit={onSubmit}>
        <div className="grid2">
          <div className="field">
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Resident"
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="unit">
              Apartment/Unit #
            </label>
            <input
              id="unit"
              className="input"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="A-304"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="email">
              Email (optional)
            </label>
            <input
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="phone">
              Phone (optional)
            </label>
            <input
              id="phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1555123456"
              autoComplete="tel"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="invite">
              Invitation code (optional)
            </label>
            <input
              id="invite"
              className="input"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="INVITE-XXXX"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="pw">
              Password
            </label>
            <input
              id="pw"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              type="password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="btnRow">
          <button className="btn btnPrimary" disabled={loading} type="submit">
            {loading ? "Creating…" : "Create account"}
          </button>
          <Link className="btn" href="/auth/login">
            I already have an account
          </Link>
        </div>
      </form>

      <p className="help">
        Privacy note: you will control what profile fields are visible to other residents.
      </p>
    </div>
  );
}
