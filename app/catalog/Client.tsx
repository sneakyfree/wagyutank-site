"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function Client() {
  const { user } = useAuth();
  const [info, setInfo] = useState<any>(null);
  useEffect(() => { api.catalogInfo().then(setInfo).catch(() => setInfo(false)); }, []);

  return (
    <div className="container section" style={{ maxWidth: 900 }}>
      <span className="pill">📕 Print edition · twice a year</span>
      <h1 style={{ fontSize: "2.3rem", marginTop: 12 }}>The WagyuTank Semen Catalog</h1>
      <p className="muted" style={{ lineHeight: 1.7, maxWidth: "72ch", fontSize: "1.05rem" }}>
        A real, printed catalog of Wagyu semen and genetics — mailed to breeders so it lands on the
        kitchen table right when mating decisions are being made. Two editions a year, timed to
        breeding season on each side of the equator. <strong className="gold">Every member gets a
        digital copy; submitters can receive a printed copy in the mail.</strong>
      </p>

      {/* Live current-edition callout */}
      {info && info !== false && (
        <div className="card card-pad" style={{ borderColor: "var(--gold)", marginTop: 20 }}>
          <div className="row wrap" style={{ alignItems: "center", gap: 12 }}>
            <div>
              <div className="faint" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Now accepting entries</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: 2 }}>{info.catalog_edition_label}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Submission deadline <strong className="gold">{info.catalog_deadline}</strong> · mails {info.catalog_mail_month}
                {info.submission_count ? ` · ${info.submission_count} entries so far` : ""}
              </div>
            </div>
            <div className="spacer" />
            {info.catalog_submit_open
              ? <Link href="/catalog/submit" className="btn btn-gold btn-lg">Submit your genetics →</Link>
              : <span className="pill pill-dim">Submissions closed for this edition</span>}
          </div>
        </div>
      )}

      <div className="row wrap" style={{ gap: 16, marginTop: 24, alignItems: "stretch" }}>
        <div className="card card-pad" style={{ flex: "1 1 300px" }}>
          <h3 style={{ marginTop: 0 }}>🌱 Spring-Calving Program Edition</h3>
          <p className="muted" style={{ lineHeight: 1.65 }}>
            North American and European herds mostly calve in late winter and spring, which puts AI
            season in <b>May–July</b>. This edition mails in <b>early March</b>, while sire lists are
            still open.
          </p>
          <div className="kv"><span className="k">Listing deadline</span><span className="gold"><b>February 1</b></span></div>
          <div className="kv"><span className="k">Mails</span><span>early March</span></div>
        </div>
        <div className="card card-pad" style={{ flex: "1 1 300px" }}>
          <h3 style={{ marginTop: 0 }}>🍂 Fall-Calving Program Edition</h3>
          <p className="muted" style={{ lineHeight: 1.65 }}>
            Australian, New Zealand, and South American spring-calving herds join from
            <b> October–January</b>. This edition mails in <b>early October</b>, ahead of joining.
          </p>
          <div className="kv"><span className="k">Listing deadline</span><span className="gold"><b>September 1</b></span></div>
          <div className="kv"><span className="k">Mails</span><span>early October</span></div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>How to get your bull in the book</h3>
        <ol style={{ lineHeight: 2, margin: 0, paddingLeft: 20 }}>
          <li><Link href="/catalog/submit" className="gold">Submit your genetics</Link> — bull, semen, embryos, or your whole ranch. Free during launch.</li>
          <li>Add a mailing address if you'd like a printed copy shipped to you.</li>
          <li>We review entries, lay out the edition, and mail it before the breeding window opens. Every member also gets the digital edition by email.</li>
        </ol>
        <p className="help" style={{ marginTop: 12 }}>
          Already have a semen listing? You can also flag it for the catalog right from your
          <Link href="/dashboard" className="gold"> dashboard</Link>.
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href={user ? "/catalog/submit" : "/login?next=/catalog/submit"} className="btn btn-gold btn-lg">
          {user ? "Submit to the catalog" : "Sign in to submit"}
        </Link>
      </div>
    </div>
  );
}
