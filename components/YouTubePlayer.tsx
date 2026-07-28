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
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const cuesRef = useRef<Cue[] | null>(null);
  const [line, setLine] = useState("");
  const [mine, setMine] = useState(false);      // are we driving the subtitles?
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} title={title} style={{ width: "100%", height: "100%" }} />
      {mine && line && (
        <div aria-live="polite" style={{
          position: "absolute", left: 0, right: 0, bottom: "9%",
          display: "flex", justifyContent: "center", pointerEvents: "none", padding: "0 6%",
        }}>
          <span style={{
            background: "rgba(0,0,0,0.78)", color: "#fff", padding: "0.28em 0.6em",
            borderRadius: 4, fontSize: "clamp(0.85rem, 2vw, 1.15rem)", lineHeight: 1.35,
            textAlign: "center", textShadow: "0 1px 2px rgba(0,0,0,0.9)",
          }}>{line}</span>
        </div>
      )}
    </div>
  );
}
