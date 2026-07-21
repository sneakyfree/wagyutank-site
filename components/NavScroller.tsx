"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// The desktop nav has outgrown one row: past ~10 items it used to run off the
// right edge of the header and those links became unreachable at anything but a
// maximised window. Rather than hide links behind a breakpoint, the row now
// scrolls, and chevrons appear on whichever side still has content — so every
// destination stays reachable at every window width, with a mouse or without.
export default function NavScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOver({ left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const c of Array.from(el.children)) ro.observe(c);
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const nudge = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <div className="nav-scroller">
      {over.left && (
        <button type="button" className="nav-arrow nav-arrow-l" aria-label="Scroll navigation left"
                onClick={() => nudge(-1)}>‹</button>
      )}
      <div className="nav-track" ref={ref}>{children}</div>
      {over.right && (
        <button type="button" className="nav-arrow nav-arrow-r" aria-label="Scroll navigation right"
                onClick={() => nudge(1)}>›</button>
      )}
    </div>
  );
}
