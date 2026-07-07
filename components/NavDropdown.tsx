"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Item = { href: string; label: string; desc?: string };

export default function NavDropdown({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="nav-dd" ref={ref}>
      <button className={`nav-link nav-dd-btn ${open ? "on" : ""}`} onClick={() => setOpen((o) => !o)}>
        {label} <span className="nav-dd-caret">▾</span>
      </button>
      {open && (
        <div className="nav-dd-menu">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="nav-dd-item" onClick={() => setOpen(false)}>
              <span className="nav-dd-item-label">{it.label}</span>
              {it.desc && <span className="nav-dd-item-desc">{it.desc}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
