import Link from "next/link";

export default function NotFound() {
  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">404 — Page Not Found</h2>
        <p className="subtitle">The page you’re looking for doesn’t exist.</p>
      </header>

      <div className="btnRow">
        <Link className="btn btnPrimary" href="/">
          Go to Directory
        </Link>
      </div>
    </div>
  );
}
