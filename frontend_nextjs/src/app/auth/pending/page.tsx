import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="vStack">
      <header className="vStack" style={{ gap: 4 }}>
        <h2 className="title">Approval pending</h2>
        <p className="subtitle">
          Your registration has been received. If your community requires approval, an
          admin will review your request.
        </p>
      </header>

      <section className="alert alertInfo" role="status">
        <div className="vStack">
          <strong>What to do next</strong>
          <ul className="vStack" style={{ gap: 6, paddingLeft: 18 }}>
            <li>Check your email/phone for updates.</li>
            <li>Try logging in again later.</li>
          </ul>
        </div>
      </section>

      <div className="btnRow">
        <Link className="btn btnPrimary" href="/auth/login">
          Back to Login
        </Link>
        <Link className="btn" href="/">
          Go to Directory
        </Link>
      </div>
    </div>
  );
}
