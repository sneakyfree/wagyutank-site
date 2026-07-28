"use client";
import { useEffect, useRef } from "react";
import { useLang } from "../lib/i18n";

// A YouTube embed that turns on captions and asks YouTube to auto-translate them
// into the viewer's language.
//
// Why this exists: half the Japan hub is Japanese-language footage, and a French
// or Korean breeder previously got audio they could not understand and no
// subtitles at all. YouTube DOES hold auto-captions for these videos in every
// language the site offers — verified with `yt-dlp --list-subs` against real
// Japan-hub videos (cs de en es fr hu it ja ko pl pt tr zh-Hans) — and the player
// reports the source track as `is_translateable: true`.
//
// The trap: `cc_lang_pref` alone does NOT translate. Verified live on the Japan
// page — with cc_lang_pref=ko the track stayed on the English ASR feed. Only
// setOption('captions','translationLanguage') actually switches it, and that has
// to happen AFTER the captions module has loaded, which is why this listens for
// onApiChange rather than firing once on ready.
//
// setOption/translationLanguage is a long-standing but UNDOCUMENTED part of the
// IFrame API. Every call is wrapped: if YouTube changes it, the video still plays
// exactly as before and the viewer simply sees no auto-translation. It must never
// be able to break playback.

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void; __ytApiLoading?: boolean; }
}

// Site locale → YouTube caption language code. Mostly identical; Chinese needs
// the script-qualified form YouTube actually serves.
const YT_LANG: Record<string, string> = {
  en: "en", es: "es", pt: "pt", de: "de", ja: "ja", zh: "zh-Hans",
  fr: "fr", it: "it", ko: "ko", tr: "tr", cs: "cs", pl: "pl", hu: "hu", id: "id",
};

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

export default function YouTubePlayer({ videoId, title }: { videoId: string; title?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const { lang } = useLang();
  const cc = YT_LANG[lang] || "en";

  useEffect(() => {
    let dead = false;
    let applied = false;

    function applyCaptions(p: any) {
      // Idempotent: onApiChange can fire more than once.
      if (applied) return;
      try {
        p.loadModule("captions");                                   // no-op if already up
        const track = p.getOption("captions", "track");
        if (!track) return;                                          // module not ready yet
        if (lang !== "en") {
          p.setOption("captions", "translationLanguage", { languageCode: cc });
          p.setOption("captions", "reload", true);
        }
        applied = true;
      } catch {
        /* undocumented API — never let it break playback */
      }
    }

    loadApi().then(() => {
      if (dead || !hostRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          // cc_load_policy turns the caption layer on; hl localises the player
          // chrome itself. Both verified working. cc_lang_pref is kept as the
          // hint for videos that genuinely ship a track in this language — it is
          // just not sufficient on its own.
          cc_load_policy: 1, cc_lang_pref: cc, hl: cc,
          rel: 0, modestbranding: 1, playsinline: 1,
        },
        events: {
          onApiChange: (e: any) => applyCaptions(e.target),
          onStateChange: (e: any) => { if (e.data === 1) applyCaptions(e.target); },
        },
      });
    });

    return () => {
      dead = true;
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
    };
  }, [videoId, lang, cc]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={hostRef} title={title} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
