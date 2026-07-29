"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/i18n";
import { API_BASE } from "../lib/api";

// A YouTube embed with subtitles in the viewer's language, from the best source
// we have for that video.
//
// TWO CAPTION SOURCES, one switch, best-available wins per video:
//
//   ours      — a VideoTranscript row for (video, language). Translated on the
//               durable tier, so it knows 種雄牛 is a breeding bull, A5 is a
//               grade and 但馬 is Tajima. YouTube's auto-translate knows none of
//               that: it is machine-translating machine-transcribed audio.
//   YouTube's — auto-translated captions, available on every video in all 14 of
//               our languages, instantly, for free.
//
// They must never both render — that is two subtitle lines disagreeing with each
// other over the same strip of pixels. So: if we have a transcript we turn
// YouTube's caption layer OFF and draw our own; if we do not, we leave YouTube's
// running untouched. A video we have not transcribed is never worse off than
// before, which is what lets transcripts land as DATA, one video and one
// language at a time, with no code change.
//
// Findings this is built on (re-verify before changing any of it):
//  - YouTube holds auto-captions for the Japan-hub videos in all 14 languages —
//    proven with `yt-dlp --list-subs` (cs de en es fr hu it ja ko pl pt tr zh-Hans).
//  - The player reports the source track as `is_translateable: true`.
//  - `cc_load_policy=1` and `hl=<lang>` work.
//  - TRAP: `cc_lang_pref` alone does NOT translate — verified live, the track
//    stayed on the English ASR feed. Only setOption(translationLanguage) does,
//    and only after the captions module has loaded, hence onApiChange.
//
// setOption/captions is UNDOCUMENTED. Every call is wrapped: if YouTube changes
// it, the video still plays and the viewer just sees no auto-translation. It must
// never be able to break playback.
//
// FULLSCREEN (fixed 2026-07-29 — it was broken, and broken in the worst way):
// our overlay is a SIBLING of the iframe, so when YouTube's own fullscreen button
// promotes the IFRAME to document.fullscreenElement the overlay is outside the
// fullscreen subtree and does not paint. Since we have also switched YouTube's
// captions off, a fullscreen viewer of a TRANSCRIBED video got no subtitles at
// all — strictly worse than an untranscribed one, which inverts the whole
// "never worse off" invariant above. So when we are driving the subtitles we hide
// YouTube's fullscreen button (`fs: 0`) and fullscreen the WRAPPER instead, which
// contains both the iframe and the overlay. When YouTube is drawing its own
// captions we leave its button alone — those live inside the iframe and are fine.

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void; __ytApiLoading?: boolean; }
}

const YT_LANG: Record<string, string> = {
  en: "en", es: "es", pt: "pt", de: "de", ja: "ja", zh: "zh-Hans",
  fr: "fr", it: "it", ko: "ko", tr: "tr", cs: "cs", pl: "pl", hu: "hu", id: "id",
};

type Cue = { t: number; d: number; x: string };

function loadApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!window.__ytApiLoading) {
      window.__ytApiLoading = true;
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
}

export default function YouTubePlayer({
  videoId, dbId, title,
}: { videoId: string; dbId?: number | string; title?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const cuesRef = useRef<Cue[] | null>(null);
  const [line, setLine] = useState("");
  const [mine, setMine] = useState(false);      // are we driving the subtitles?
  const [full, setFull] = useState(false);
  const { lang } = useLang();
  const cc = YT_LANG[lang] || "en";

  // 1. Do we have our own transcript for this video + language? A 404 is the
  //    normal, expected answer for most videos — it just means YouTube keeps the job.
  useEffect(() => {
    let dead = false;
    cuesRef.current = null; setMine(false); setLine("");
    if (!dbId) return;
    fetch(`${API_BASE}/api/videos/${dbId}/transcript?lang=${encodeURIComponent(lang)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (dead || !d?.cues?.length) return;
        cuesRef.current = d.cues;
        setMine(true);
      })
      .catch(() => { /* no transcript — YouTube's captions stay on */ });
    return () => { dead = true; };
  }, [dbId, lang]);

  // 2. Player + the caption switch.
  useEffect(() => {
    let dead = false;
    let applied = false;
    let timer: any = null;

    function applyCaptions(p: any) {
      if (applied) return;
      try {
        p.loadModule("captions");
        if (mine) {
          // Ours is better for this video — stand YouTube's layer down so the
          // two never draw over each other.
          p.setOption("captions", "track", {});
        } else if (lang !== "en") {
          p.setOption("captions", "translationLanguage", { languageCode: cc });
          p.setOption("captions", "reload", true);
        }
        applied = true;
      } catch {
        /* undocumented API — never let it break playback */
      }
    }

    function tick() {
      const cues = cuesRef.current;
      const p = playerRef.current;
      if (!cues || !p?.getCurrentTime) return;
      let t = 0;
      try { t = p.getCurrentTime() || 0; } catch { return; }
      const hit = cues.find((c) => t >= c.t && t < c.t + c.d);
      setLine(hit ? hit.x : "");
    }

    loadApi().then(() => {
      if (dead || !hostRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          cc_load_policy: mine ? 0 : 1, cc_lang_pref: cc, hl: cc,
          // Ours must fullscreen the wrapper, not the iframe — see the note above.
          fs: mine ? 0 : 1,
          rel: 0, modestbranding: 1, playsinline: 1,
        },
        events: {
          onApiChange: (e: any) => applyCaptions(e.target),
          onStateChange: (e: any) => {
            applyCaptions(e.target);
            if (e.data === 1 && cuesRef.current && !timer) timer = setInterval(tick, 250);
            if (e.data !== 1 && timer) { clearInterval(timer); timer = null; }
          },
        },
      });
    });

    return () => {
      dead = true;
      if (timer) clearInterval(timer);
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
    };
  }, [videoId, lang, cc, mine]);

  // 3. Fullscreen, ours. Keep the button label honest, and if the iframe somehow
  //    still becomes the fullscreen element (an embed build where `fs: 0` does not
  //    also disable double-click, say) hand fullscreen back to the wrapper so the
  //    subtitles survive. Every branch is guarded — failing here must leave the
  //    viewer windowed with subtitles, never blocked.
  useEffect(() => {
    function onChange() {
      const el = document.fullscreenElement;
      setFull(!!el && el === wrapRef.current);
      if (!mine || !el || el === wrapRef.current) return;
      if (!wrapRef.current?.contains(el)) return;   // not our player — leave it be
      (async () => {
        try {
          await document.exitFullscreen();
          await wrapRef.current?.requestFullscreen();
        } catch { /* windowed with subtitles beats fullscreen without them */ }
      })();
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [mine]);

  async function toggleFull() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapRef.current?.requestFullscreen();
    } catch { /* ignore — never break playback */ }
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} title={title} style={{ width: "100%", height: "100%" }} />
      {/* data-noloc: this line is ALREADY in the reader's language, translated on
          the durable tier by translate_transcripts. Without it the whole-page
          AutoTranslate sweep picks the text node up like any other page copy and
          re-translates it on the BULK tier — a target→target round trip that
          spends tokens to overwrite better output with worse. Verified live on
          2026-07-29: a Korean cue was POSTed back to /api/translate and rewritten
          on screen. AutoTranslate was also the source of the 07-24 cache
          poisoning; keep it out of the subtitle path. */}
      {mine && line && (
        <div aria-live="polite" data-noloc style={{
          position: "absolute", left: 0, right: 0, bottom: full ? "11%" : "9%",
          display: "flex", justifyContent: "center", pointerEvents: "none", padding: "0 6%",
        }}>
          <span style={{
            background: "rgba(0,0,0,0.78)", color: "#fff", padding: "0.28em 0.6em",
            borderRadius: 4,
            fontSize: full ? "clamp(1.1rem, 2.4vw, 2rem)" : "clamp(0.85rem, 2vw, 1.15rem)",
            lineHeight: 1.35,
            textAlign: "center", textShadow: "0 1px 2px rgba(0,0,0,0.9)",
          }}>{line}</span>
        </div>
      )}
      {mine && (
        <button
          type="button" onClick={toggleFull} data-noloc
          aria-label={full ? "Exit full screen" : "Full screen"}
          title={full ? "Exit full screen" : "Full screen"}
          style={{
            position: "absolute", right: 6, bottom: 4, width: 38, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: 0, borderRadius: 3, cursor: "pointer",
            color: "#fff", opacity: 0.92, padding: 0, lineHeight: 0,
          }}
        >
          {/* Matches YouTube's own corner-bracket glyph, in the slot `fs: 0` frees up. */}
          <svg viewBox="0 0 36 36" width="24" height="24" aria-hidden="true" focusable="false">
            <path fill="#fff" d={full
              ? "M14 14H8v2h4v4h2v-6zm8 0v6h2v-4h4v-2h-6zM8 20v2h4v4h2v-6H8zm14 6h2v-4h4v-2h-6v6z"
              : "M10 16h2v-4h4v-2h-6v6zm10-6v2h4v4h2v-6h-6zM8 20v6h6v-2h-4v-4H8zm16 4h-4v2h6v-6h-2v4z"} />
          </svg>
        </button>
      )}
    </div>
  );
}
