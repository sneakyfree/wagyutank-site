"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "es";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    "nav.browse": "Browse", "nav.semen": "Semen", "nav.embryos": "Embryos", "nav.cloning": "Cloning",
    "nav.roundup": "Roundup", "nav.news": "News", "nav.market": "Market", "nav.history": "Breed History", "nav.advertise": "Advertise",
    "nav.sell": "+ Sell", "nav.signin": "Sign in", "nav.signout": "Sign out", "nav.admin": "⚙ Admin",
    "nav.browseall": "Browse all", "nav.foundation": "Foundation Bloodlines",
    "nav.marketdata": "Market Data", "nav.records": "Record Sales", "nav.data": "Data",
    "nav.browse_all_desc": "Every listing", "nav.foundation_desc": "The founding sires & dams",
    "nav.marketdata_desc": "Cattle & beef prices", "nav.records_desc": "Biggest sales ever",
    "nav.semen_desc": "Straws for sale", "nav.embryos_desc": "Embryos for sale", "nav.cloning_desc": "Cloning rights",
    "hero.eyebrow": "🥩 THE GLOBAL WAGYU CROSSROADS",
    "hero.title": "The world's marketplace & knowledge hub for Wagyu genetics.",
    "hero.sub": "Buy and sell semen, embryos, and cloning rights — and explore the deepest breed history, a live price index, and bloodlines traced to the original foundation sires. List in under a minute. Free.",
    "hero.search": "Search Michifuku, Tajima, Itoshigenami…",
    "hero.list": "List your genetics →", "hero.explore": "Explore the breed history",
    "home.fresh": "Fresh listings", "home.wire": "📰 The Wagyu Wire", "home.roundup": "📡 The Roundup",
    "home.allnews": "All news →", "home.allweb": "All web listings →",
    "home.wire_sub": "Global Wagyu headlines — including Japanese reporting translated into English, found nowhere else.",
    "home.roundup_sub": "Wagyu genetics for sale from across the web, gathered in one place. Not WagyuTank sellers — each links back to the original listing.",
    "home.foundation": "Foundation bloodlines",
    "common.search": "Search",
    "footer.tagline": "The world's marketplace & knowledge hub for Wagyu genetics.",
  },
  es: {
    "nav.browse": "Explorar", "nav.semen": "Semen", "nav.embryos": "Embriones", "nav.cloning": "Clonación",
    "nav.roundup": "Recopilación", "nav.news": "Noticias", "nav.market": "Mercado", "nav.history": "Historia de la Raza", "nav.advertise": "Anunciar",
    "nav.sell": "+ Vender", "nav.signin": "Iniciar sesión", "nav.signout": "Cerrar sesión", "nav.admin": "⚙ Admin",
    "nav.browseall": "Ver todo", "nav.foundation": "Linajes Fundadores",
    "nav.marketdata": "Datos de Mercado", "nav.records": "Ventas Récord", "nav.data": "Datos",
    "nav.browse_all_desc": "Todas las publicaciones", "nav.foundation_desc": "Sementales y madres fundadoras",
    "nav.marketdata_desc": "Precios de ganado y carne", "nav.records_desc": "Las mayores ventas",
    "nav.semen_desc": "Pajillas a la venta", "nav.embryos_desc": "Embriones a la venta", "nav.cloning_desc": "Derechos de clonación",
    "hero.eyebrow": "🥩 EL CRUCE GLOBAL DEL WAGYU",
    "hero.title": "El mercado y centro de conocimiento mundial de la genética Wagyu.",
    "hero.sub": "Compra y vende semen, embriones y derechos de clonación — y explora la historia más profunda de la raza, un índice de precios en vivo y linajes que se remontan a los sementales fundadores originales. Publica en menos de un minuto. Gratis.",
    "hero.search": "Busca Michifuku, Tajima, Itoshigenami…",
    "hero.list": "Publica tu genética →", "hero.explore": "Explora la historia de la raza",
    "home.fresh": "Publicaciones recientes", "home.wire": "📰 El Cable Wagyu", "home.roundup": "📡 La Recopilación",
    "home.allnews": "Todas las noticias →", "home.allweb": "Todas las publicaciones web →",
    "home.wire_sub": "Titulares Wagyu de todo el mundo — incluyendo reportajes japoneses traducidos al inglés, que no encontrarás en ningún otro lugar.",
    "home.roundup_sub": "Genética Wagyu a la venta de toda la web, reunida en un solo lugar. No son vendedores de WagyuTank — cada uno enlaza a la publicación original.",
    "home.foundation": "Linajes fundadores",
    "common.search": "Buscar",
    "footer.tagline": "El mercado y centro de conocimiento mundial de la genética Wagyu.",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("wt_lang")) as Lang | null;
    if (saved === "en" || saved === "es") setLangState(saved);
  }, []);
  function setLang(l: Lang) { setLangState(l); try { localStorage.setItem("wt_lang", l); } catch {} }
  const t = (k: string) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k;
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
