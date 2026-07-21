"use client";
import { Children, Fragment, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import NavDropdown from "./NavDropdown";

/** The desktop nav, with everything that doesn't fit collected into a labelled
 *  "More" menu.
 *
 *  It used to scroll sideways with a pair of small chevrons at the edges. That
 *  kept every link reachable in principle, but a faint ‹ › is easy to read as
 *  decoration -- so links past the fold were effectively invisible, which is
 *  worse than being in a menu that says how many there are.
 *
 *  Widths are read from a hidden copy of the full row. Measuring the row we
 *  actually render would be circular: hiding an item sets its width to zero, so
 *  the next measurement would think it fits and put it back, forever.
 */
export default function NavOverflow({ children }: { children: React.ReactNode }) {
  // The nav is handed to us as a single fragment, and React counts a fragment as
  // ONE child however many links are inside it. Counting that way, nothing ever
  // overflowed and the More button never appeared -- while the row quietly
  // clipped. Flatten one level so the items are the links themselves.
  const items = Children.toArray(children)
    .flatMap((c) => (isValidElement(c) && c.type === Fragment
      ? Children.toArray((c.props as { children?: React.ReactNode }).children)
      : [c]))
    .filter(isValidElement);
  const hostRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [nShown, setNShown] = useState(items.length);
  const [open, setOpen] = useState(false);

  const measure = useCallback(() => {
    const host = hostRef.current;
    const probe = measureRef.current;
    if (!host || !probe) return;
    const widths = Array.from(probe.children).map((c) => (c as HTMLElement).offsetWidth + 4);
    const total = widths.reduce((a, b) => a + b, 0);
    const avail = host.clientWidth;
    if (total <= avail) {
      setNShown(widths.length);
      return;
    }
    // Room for the "More" button has to come out of the budget before we decide
    // what fits, or the button itself pushes the last item off the edge.
    const MORE_W = 92;
    let used = MORE_W;
    let n = 0;
    for (const w of widths) {
      if (used + w > avail) break;
      used += w;
      n++;
    }
    setNShown(Math.max(1, n));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (hostRef.current) ro.observe(hostRef.current);
    if (measureRef.current) ro.observe(measureRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, items.length]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (hostRef.current && !hostRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const shown = items.slice(0, nShown);
  const hidden = items.slice(nShown);

  return (
    <div className="nav-overflow" ref={hostRef}>
      {/* Off-screen copy at full width — the only honest source of item widths. */}
      <div className="nav-measure" ref={measureRef} aria-hidden="true">{items}</div>

      <div className="nav-row">{shown}</div>

      {hidden.length > 0 && (
        <div className="nav-more">
          <button
            type="button"
            className={`nav-link nav-more-btn ${open ? "on" : ""}`}
            aria-expanded={open}
            aria-label={`${hidden.length} more navigation links`}
            onClick={() => setOpen((o) => !o)}
          >
            More <span className="nav-more-count">{hidden.length}</span>
          </button>
          {open && (
            <div
              className="nav-more-menu"
              // Close on a destination, not on any click: pressing a group
              // heading or the panel's own padding should not dismiss it.
              onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}
            >
              {hidden.map((it, i) => {
                if (isValidElement(it) && it.type === NavDropdown) {
                  const { label, items: sub } = it.props as {
                    label: string; items: { href: string; label: string }[];
                  };
                  return (
                    <div className="nav-more-group" key={i}>
                      <p className="nav-more-group-title">{label}</p>
                      {sub.map((it2) => (
                        <Link key={it2.href} href={it2.href} className="nav-link nav-more-sub">{it2.label}</Link>
                      ))}
                    </div>
                  );
                }
                return <div className="nav-more-row" key={i}>{it}</div>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
