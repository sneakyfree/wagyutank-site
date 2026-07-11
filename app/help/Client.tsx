"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";

function QA({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="card-pad"
        style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
      >
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.02rem", flex: 1, fontWeight: 600 }}>{q}</h3>
          <span className="gold" style={{ fontSize: "1.2rem" }}>{open ? "–" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="card-pad" style={{ paddingTop: 0 }}>
          <p className="muted" style={{ lineHeight: 1.7, fontSize: "0.95rem", borderTop: "1px solid var(--border)", paddingTop: 12, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

type Msg = { role: "you" | "bot"; text: string };

export default function Client() {
  const { lang } = useLang();
  const [faq, setFaq] = useState<any>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { api.faq(lang).then(setFaq).catch(() => setFaq({ intro: "", categories: [] })); }, [lang]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setMsgs((m) => [...m, { role: "you", text: q }]);
    setInput(""); setBusy(true);
    try {
      const r = await api.helpAsk(q, lang);
      setProvider(r?.provider || null);
      setMsgs((m) => [...m, { role: "bot", text: r?.answer || "Sorry, I couldn't answer that." }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: "bot", text: err?.message || "The assistant is unavailable right now. Email office@wagyutank.com." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 820, padding: "32px 16px 60px" }}>
      <h1 style={{ marginBottom: 6 }}>Help &amp; FAQ</h1>
      <p className="muted" style={{ maxWidth: 640, lineHeight: 1.7 }}>{faq?.intro}</p>

      {(faq?.categories || []).map((cat: any, ci: number) => (
        <section key={ci} style={{ marginTop: 28 }}>
          <h2 className="gold" style={{ fontSize: "1.15rem", marginBottom: 12 }}>{cat.name}</h2>
          <div className="stack" style={{ gap: 8 }}>
            {(cat.items || []).map((it: any, i: number) => <QA key={i} q={it.q} a={it.a} />)}
          </div>
        </section>
      ))}

      <section style={{ marginTop: 40 }}>
        <h2 className="gold" style={{ fontSize: "1.15rem", marginBottom: 4 }}>Ask the WagyuTank assistant</h2>
        <p className="faint" style={{ fontSize: "0.85rem", marginBottom: 12 }}>
          Anything not covered above — about the site, buying/selling genetics, or the breed. Answers in your language.
        </p>
        <div className="card card-pad" style={{ background: "var(--bg-elev)" }}>
          <div style={{ maxHeight: 340, overflowY: "auto", marginBottom: 12 }}>
            {msgs.length === 0 && (
              <p className="faint" style={{ fontSize: "0.9rem" }}>
                e.g. “What's the difference between semen and embryos?” · “Can I ship to Australia?” · “How do I start a Wagyu herd?”
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ margin: "8px 0", textAlign: m.role === "you" ? "right" : "left" }}>
                <span style={{
                  display: "inline-block", maxWidth: "85%", padding: "8px 12px", borderRadius: 12,
                  fontSize: "0.92rem", lineHeight: 1.6, whiteSpace: "pre-wrap",
                  background: m.role === "you" ? "var(--gold)" : "var(--bg)",
                  color: m.role === "you" ? "#1a1200" : "inherit",
                  border: m.role === "you" ? "none" : "1px solid var(--border)",
                }}>{m.text}</span>
              </div>
            ))}
            {busy && <p className="faint" style={{ fontSize: "0.85rem" }}>Thinking…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="row" style={{ gap: 8 }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)} disabled={busy}
              placeholder="Ask a question about Wagyu…"
              style={{ flex: 1, minWidth: 0, padding: "9px 12px" }}
            />
            <button type="submit" className="btn btn-gold" disabled={busy || !input.trim()}>Ask</button>
          </form>
          {provider && (
            <p className="faint" style={{ fontSize: "0.7rem", marginTop: 8, marginBottom: 0 }}>
              Answers are AI-generated for general guidance — always confirm prices, availability, and import rules with the seller. Powered by {provider}.
            </p>
          )}
        </div>
      </section>

      <p className="faint" style={{ fontSize: "0.85rem", marginTop: 32, textAlign: "center" }}>
        Still stuck? Email <a href="mailto:office@wagyutank.com" className="gold">office@wagyutank.com</a>.
      </p>
    </div>
  );
}
