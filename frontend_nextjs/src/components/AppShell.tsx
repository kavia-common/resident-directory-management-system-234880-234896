"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnnouncementsApi, type Announcement } from "@/lib/api";
import {
  clearSessionUser,
  clearToken,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      className={`btn ${active ? "btnPrimary" : ""}`}
      href={href}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function UserBadge({ user }: { user: SessionUser | null }) {
  if (!user) return <span className="badge">Guest</span>;
  return (
    <span className="badge badgePrimary">
      {user.role.toUpperCase()} • {user.name || user.email || user.phone || user.id}
    </span>
  );
}

function AnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await AnnouncementsApi.list();
        if (!cancelled) setItems(data.slice(0, 3));
      } catch {
        // Banner is best-effort; failures are non-blocking.
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="card panel" aria-label="Announcements banner">
      <div className="hStack" style={{ justifyContent: "space-between" }}>
        <div className="vStack" style={{ gap: 4 }}>
          <div className="hStack">
            <span className="badge badgeSuccess">Announcements</span>
            {loading ? <span className="label">Loading…</span> : null}
          </div>
          {items.length === 0 ? (
            <p className="subtitle">No announcements yet.</p>
          ) : (
            <ul className="vStack" style={{ gap: 6 }}>
              {items.map((a) => (
                <li key={a.id}>
                  <span className="label">{new Date(a.createdAt).toLocaleString()}</span>
                  <div className="hStack" style={{ alignItems: "baseline" }}>
                    <strong>{a.title}</strong>
                    <span className="subtitle">{a.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link className="btn btnGhost" href="/announcements">
          View all →
        </Link>
      </div>
    </section>
  );
}

/**
 * App-wide shell with retro navigation. This is intentionally client-side so it
 * can read auth state and show user badge/logout without server auth plumbing.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  function onLogout() {
    clearToken();
    clearSessionUser();
    setUser(null);
    router.push("/auth/login");
  }

  return (
    <div className="appShell">
      <aside className="card panel" aria-label="Sidebar navigation">
        <div className="vStack">
          <header className="vStack" style={{ gap: 6 }}>
            <h1 className="title">Resident Directory</h1>
            <p className="subtitle">Retro-secure • privacy-first</p>
            <UserBadge user={user} />
          </header>

          <hr className="hr" />

          <nav className="vStack" aria-label="Primary">
            <NavLink href="/" label="Directory" />
            <NavLink href="/profile" label="My Profile" />
            <NavLink href="/announcements" label="Announcements" />
            {!user ? (
              <>
                <NavLink href="/auth/login" label="Login" />
                <NavLink href="/auth/register" label="Register" />
              </>
            ) : (
              <button className="btn btnDanger" onClick={onLogout}>
                Log out
              </button>
            )}
          </nav>

          {isAdmin ? (
            <>
              <hr className="hr" />
              <div className="vStack" aria-label="Admin">
                <span className="label">Admin</span>
                <NavLink href="/admin/approvals" label="Approvals" />
                <NavLink href="/admin/residents" label="Resident Mgmt" />
                <NavLink href="/admin/announcements" label="Post Announcement" />
              </div>
            </>
          ) : null}

          <hr className="hr" />
          <p className="help">
            Tip: Use <span className="kbd">Search</span> and filters to find neighbors.
          </p>
        </div>
      </aside>

      <main className="vStack" style={{ gap: 14 }}>
        <AnnouncementBanner />
        <div className="card panel">{children}</div>
      </main>
    </div>
  );
}
