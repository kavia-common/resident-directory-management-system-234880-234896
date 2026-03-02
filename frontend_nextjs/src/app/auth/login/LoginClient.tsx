"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthApi } from "@/lib/api";
import { setSessionUser, setToken } from "@/lib/auth";

type Mode = "password" | "otp";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams]);

  const [mode, setMode] = useState<Mode>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!identifier.trim()) {
      setErr("Email or phone is required.");
      return;
    }
    if (!password) {
      setErr("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const resp = await AuthApi.login({ identifier, password });
      setToken(resp.token);
      setSessionUser(resp.user);

      if (resp.approvalStatus === "pending") {
        router.push("/auth/pending");
      } else {
        router.push(nextPath);
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onRequestOtp() {
    setErr(null);
    if (!identifier.trim()) {
      setErr("Email or phone is required.");
      return;
    }
    setLoading(true);
    try {
      const resp = await AuthApi.requestOtp({ identifier });
      setOtpSent(Boolean(resp.sent));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "OTP request failed");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!identifier.trim()) {
      setErr("Email or phone is required.");
      return;
    }
    if (!otp.trim()) {
      setErr("OTP is required.");
      return;
    }
    setLoading(true);
    try {
      const resp = await AuthApi.verifyOtp({ identifier, otp });
      setToken(resp.token);
      setSessionUser(resp.user);

      if (resp.approvalStatus === "pending") {
        router.push("/auth/pending");
      } else {
        router.push(nextPath);
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "OTP verify failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Login</h2>
        <p className="subtitle">Use password or one-time code (OTP).</p>
      </header>

      <div className="btnRow" aria-label="Login mode">
        <button
          className={`btn ${mode === "password" ? "btnPrimary" : ""}`}
          onClick={() => setMode("password")}
          type="button"
        >
          Password
        </button>
        <button
          className={`btn ${mode === "otp" ? "btnPrimary" : ""}`}
          onClick={() => setMode("otp")}
          type="button"
        >
          OTP
        </button>
      </div>

      {err ? (
        <p className="alert alertError" role="alert">
          {err}
        </p>
      ) : null}

      {mode === "password" ? (
        <form className="vStack" onSubmit={onPasswordLogin}>
          <div className="field">
            <label className="label" htmlFor="identifier">
              Email or phone
            </label>
            <input
              id="identifier"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or +1555123456"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <div className="btnRow">
            <button className="btn btnPrimary" disabled={loading} type="submit">
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <Link className="btn" href="/auth/register">
              Create account
            </Link>
          </div>
        </form>
      ) : (
        <form className="vStack" onSubmit={onVerifyOtp}>
          <div className="field">
            <label className="label" htmlFor="identifier2">
              Email or phone
            </label>
            <input
              id="identifier2"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or +1555123456"
              autoComplete="username"
            />
          </div>

          <div className="btnRow">
            <button
              className="btn"
              type="button"
              onClick={onRequestOtp}
              disabled={loading}
            >
              {loading ? "Requesting…" : otpSent ? "Resend OTP" : "Request OTP"}
            </button>
            {otpSent ? <span className="badge badgeSuccess">OTP sent</span> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="otp">
              OTP code
            </label>
            <input
              id="otp"
              className="input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <div className="btnRow">
            <button className="btn btnPrimary" disabled={loading} type="submit">
              {loading ? "Verifying…" : "Verify & Sign in"}
            </button>
            <Link className="btn" href="/auth/register">
              Create account
            </Link>
          </div>
        </form>
      )}

      <p className="help">
        If admin approval is enabled for your community, you may be routed to a pending screen.
      </p>
    </div>
  );
}
