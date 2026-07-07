"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "es" | "pt" | "de";

export const LANGUAGES: { code: Lang; label: string; flag: string; english: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸", english: "English" },
  { code: "es", label: "Español", flag: "🇪🇸", english: "Spanish" },
  { code: "pt", label: "Português", flag: "🇧🇷", english: "Portuguese" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", english: "German" },
];

const K = {
  "nav.browse": ["Browse", "Explorar", "Explorar", "Durchsuchen"],
  "nav.semen": ["Semen", "Semen", "Sêmen", "Sperma"],
  "nav.embryos": ["Embryos", "Embriones", "Embriões", "Embryonen"],
  "nav.cloning": ["Cloning", "Clonación", "Clonagem", "Klonen"],
  "nav.roundup": ["Roundup", "Recopilación", "Compilação", "Übersicht"],
  "nav.news": ["News", "Noticias", "Notícias", "Nachrichten"],
  "nav.market": ["Market", "Mercado", "Mercado", "Markt"],
  "nav.marketdata": ["Market Data", "Datos de Mercado", "Dados de Mercado", "Marktdaten"],
  "nav.records": ["Record Sales", "Ventas Récord", "Vendas Recordes", "Rekordverkäufe"],
  "nav.salereports": ["Sale Reports", "Informes de Venta", "Relatórios de Venda", "Verkaufsberichte"],
  "nav.data": ["Data", "Datos", "Dados", "Daten"],
  "nav.history": ["Breed History", "Historia de la Raza", "História da Raça", "Rassegeschichte"],
  "nav.advertise": ["Advertise", "Anunciar", "Anunciar", "Werben"],
  "nav.sell": ["+ Sell", "+ Vender", "+ Vender", "+ Verkaufen"],
  "nav.signin": ["Sign in", "Iniciar sesión", "Entrar", "Anmelden"],
  "nav.signout": ["Sign out", "Cerrar sesión", "Sair", "Abmelden"],
  "nav.admin": ["⚙ Admin", "⚙ Admin", "⚙ Admin", "⚙ Admin"],
  "nav.browseall": ["Browse all", "Ver todo", "Ver tudo", "Alle ansehen"],
  "nav.foundation": ["Foundation Bloodlines", "Linajes Fundadores", "Linhagens Fundadoras", "Gründerlinien"],
  "nav.browse_all_desc": ["Every listing", "Todas las publicaciones", "Todos os anúncios", "Alle Anzeigen"],
  "nav.foundation_desc": ["The founding sires & dams", "Sementales y madres fundadoras", "Touros e matrizes fundadores", "Die Gründertiere"],
  "nav.marketdata_desc": ["Cattle & beef prices", "Precios de ganado y carne", "Preços de gado e carne", "Rind- & Fleischpreise"],
  "nav.records_desc": ["Biggest sales ever", "Las mayores ventas", "As maiores vendas", "Größte Verkäufe"],
  "nav.salereports_desc": ["Every auction, charted", "Cada subasta, en gráficos", "Cada leilão, em gráficos", "Jede Auktion, grafisch"],
  "nav.semen_desc": ["Straws for sale", "Pajillas a la venta", "Palhetas à venda", "Portionen zum Verkauf"],
  "nav.embryos_desc": ["Embryos for sale", "Embriones a la venta", "Embriões à venda", "Embryonen zum Verkauf"],
  "nav.cloning_desc": ["Cloning rights", "Derechos de clonación", "Direitos de clonagem", "Klonrechte"],
  "hero.eyebrow": ["🥩 THE GLOBAL WAGYU CROSSROADS", "🥩 EL CRUCE GLOBAL DEL WAGYU", "🥩 O CRUZAMENTO GLOBAL DO WAGYU", "🥩 DER GLOBALE WAGYU-KNOTENPUNKT"],
  "hero.title": [
    "The world's marketplace & knowledge hub for Wagyu genetics.",
    "El mercado y centro de conocimiento mundial de la genética Wagyu.",
    "O mercado e centro de conhecimento mundial da genética Wagyu.",
    "Der weltweite Marktplatz & Wissenszentrum für Wagyu-Genetik.",
  ],
  "hero.sub": [
    "Buy and sell semen, embryos, and cloning rights — and explore the deepest breed history, a live price index, and bloodlines traced to the original foundation sires. List in under a minute. Free.",
    "Compra y vende semen, embriones y derechos de clonación — y explora la historia más profunda de la raza, un índice de precios en vivo y linajes que se remontan a los sementales fundadores. Publica en menos de un minuto. Gratis.",
    "Compre e venda sêmen, embriões e direitos de clonagem — e explore a mais profunda história da raça, um índice de preços ao vivo e linhagens que remontam aos touros fundadores. Anuncie em menos de um minuto. Grátis.",
    "Kaufen und verkaufen Sie Sperma, Embryonen und Klonrechte — und entdecken Sie die tiefste Rassegeschichte, einen Live-Preisindex und Blutlinien bis zu den ursprünglichen Gründertieren. In unter einer Minute inserieren. Kostenlos.",
  ],
  "hero.search": ["Search Michifuku, Tajima, Itoshigenami…", "Busca Michifuku, Tajima, Itoshigenami…", "Busque Michifuku, Tajima, Itoshigenami…", "Suche Michifuku, Tajima, Itoshigenami…"],
  "hero.list": ["List your genetics →", "Publica tu genética →", "Anuncie sua genética →", "Genetik inserieren →"],
  "hero.explore": ["Explore the breed history", "Explora la historia de la raza", "Explore a história da raça", "Rassegeschichte entdecken"],
  "home.wire": ["📰 The Wagyu Wire", "📰 El Cable Wagyu", "📰 O Fio Wagyu", "📰 Der Wagyu-Draht"],
  "home.roundup": ["📡 The Roundup", "📡 La Recopilación", "📡 A Compilação", "📡 Die Übersicht"],
  "home.allnews": ["All news →", "Todas las noticias →", "Todas as notícias →", "Alle Nachrichten →"],
  "home.allweb": ["All web listings →", "Todas las publicaciones web →", "Todos os anúncios web →", "Alle Web-Anzeigen →"],
  "home.wire_sub": [
    "Global Wagyu headlines — including Japanese reporting translated into English, found nowhere else.",
    "Titulares Wagyu de todo el mundo — incluyendo reportajes japoneses traducidos, que no encontrarás en ningún otro lugar.",
    "Manchetes Wagyu do mundo todo — incluindo reportagens japonesas traduzidas, que você não encontra em nenhum outro lugar.",
    "Globale Wagyu-Schlagzeilen — inklusive übersetzter japanischer Berichte, die es sonst nirgends gibt.",
  ],
  "home.roundup_sub": [
    "Wagyu genetics for sale from across the web, gathered in one place. Not WagyuTank sellers — each links back to the original listing.",
    "Genética Wagyu a la venta de toda la web, reunida en un solo lugar. No son vendedores de WagyuTank — cada uno enlaza a la publicación original.",
    "Genética Wagyu à venda de toda a web, reunida em um só lugar. Não são vendedores da WagyuTank — cada um leva ao anúncio original.",
    "Wagyu-Genetik zum Verkauf aus dem ganzen Web, an einem Ort. Keine WagyuTank-Verkäufer — jede verlinkt zur Originalanzeige.",
  ],
  "common.search": ["Search", "Buscar", "Buscar", "Suchen"],
} as const;

const IDX: Record<Lang, number> = { en: 0, es: 1, pt: 2, de: 3 };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("wt_lang")) as Lang | null;
    if (saved && IDX[saved] !== undefined) setLangState(saved);
  }, []);
  function setLang(l: Lang) { setLangState(l); try { localStorage.setItem("wt_lang", l); } catch {} }
  const t = (key: string) => {
    const row = (K as any)[key];
    return row ? (row[IDX[lang]] ?? row[0]) : key;
  };
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
