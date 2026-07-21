"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** The narrow-screen menu.
 *
 *  This was a strip of links that scrolled sideways under the header. On a phone
 *  that shows about three of eighteen destinations and gives no sign the rest
 *  exist -- a sideways scrollbar is invisible on touch. A button that says Menu
 *  states plainly that there is a menu, and the sheet shows every link at once
 *  with no scrolling trickery.
 */
export default function MobileNav({ sections }: { sections: { title: string; links: React.ReactNode[] }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigating is the one thing this menu is for, so any navigation closes it.
  useEffect(() => { setOpen(false); }, [pathname]);

  // A menu tall enough to scroll must not scroll the page underneath it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const count = sections.reduce((n, s) => n + s.links.length, 0);

  return (
    <>
      <button
        type="button"
        className={`nav-burger ${open ? "on" : ""}`}
        aria-expanded={open}
        aria-label={open ? "Close menu" : `Open menu — ${count} destinations`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav-burger-bars" aria-hidden="true"><i /><i /><i /></span>
        <span className="nav-burger-text">{open ? "Close" : "Menu"}</span>
      </button>

      {open && (
        <>
          <div className="nav-sheet-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="nav-sheet" role="dialog" aria-modal="true" aria-label="Site menu">
            {sections.map((s) => (
              s.links.length > 0 && (
                <div className="nav-sheet-group" key={s.title}>
                  <p className="nav-sheet-title">{s.title}</p>
                  <div className="nav-sheet-links">{s.links}</div>
                </div>
              )
            ))}
          </div>
        </>
      )}
    </>
  );
}
