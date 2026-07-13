"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "es" | "pt" | "de" | "ja" | "zh";

export const LANGUAGES: { code: Lang; label: string; flag: string; english: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸", english: "English" },
  { code: "es", label: "Español", flag: "🇪🇸", english: "Spanish" },
  { code: "pt", label: "Português", flag: "🇧🇷", english: "Portuguese" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", english: "German" },
  { code: "ja", label: "日本語", flag: "🇯🇵", english: "Japanese" },
  { code: "zh", label: "中文", flag: "🇨🇳", english: "Chinese" },
];

// Each key maps lang→string. Missing langs fall back to English.
const K: Record<string, Partial<Record<Lang, string>>> = {
  "nav.browse": { en: "Browse", es: "Explorar", pt: "Explorar", de: "Durchsuchen", ja: "見る", zh: "浏览" },
  "nav.semen": { en: "Semen", es: "Semen", pt: "Sêmen", de: "Sperma", ja: "精液", zh: "精液" },
  "nav.embryos": { en: "Embryos", es: "Embriones", pt: "Embriões", de: "Embryonen", ja: "受精卵", zh: "胚胎" },
  "nav.cloning": { en: "Cloning", es: "Clonación", pt: "Clonagem", de: "Klonen", ja: "クローン", zh: "克隆" },
  "nav.roundup": { en: "Roundup", es: "Recopilación", pt: "Compilação", de: "Übersicht", ja: "まとめ", zh: "汇总" },
  "nav.news": { en: "News", es: "Noticias", pt: "Notícias", de: "Nachrichten", ja: "ニュース", zh: "新闻" },
  "nav.market": { en: "Market", es: "Mercado", pt: "Mercado", de: "Markt", ja: "市場", zh: "市场" },
  "nav.marketdata": { en: "Market Data", es: "Datos de Mercado", pt: "Dados de Mercado", de: "Marktdaten", ja: "市場データ", zh: "市场数据" },
  "nav.records": { en: "Record Sales", es: "Ventas Récord", pt: "Vendas Recordes", de: "Rekordverkäufe", ja: "最高額販売", zh: "纪录成交" },
  "nav.salereports": { en: "Sale Reports", es: "Informes de Venta", pt: "Relatórios de Venda", de: "Verkaufsberichte", ja: "販売レポート", zh: "拍卖报告" },
  "nav.data": { en: "Data", es: "Datos", pt: "Dados", de: "Daten", ja: "データ", zh: "数据" },
  "nav.history": { en: "Breed History", es: "Historia de la Raza", pt: "História da Raça", de: "Rassegeschichte", ja: "品種の歴史", zh: "品种历史" },
  "nav.help": { en: "Help", es: "Ayuda", pt: "Ajuda", de: "Hilfe", ja: "ヘルプ", zh: "帮助" },
  "nav.directory": { en: "Directory", es: "Directorio", pt: "Diretório", de: "Verzeichnis", ja: "名鑑", zh: "名录" },
  "nav.advertise": { en: "Advertise", es: "Anunciar", pt: "Anunciar", de: "Werben", ja: "広告", zh: "广告" },
  "nav.catalog": { en: "Catalog", es: "Catálogo", pt: "Catálogo", de: "Katalog", ja: "カタログ", zh: "目录" },
  "nav.videos": { en: "Videos", es: "Videos", pt: "Vídeos", de: "Videos", ja: "動画", zh: "视频" },
  "nav.japan": { en: "🇯🇵 Japan", es: "🇯🇵 Japón", pt: "🇯🇵 Japão", de: "🇯🇵 Japan", ja: "🇯🇵 日本", zh: "🇯🇵 日本" },
  "nav.feeding": { en: "Feeding", es: "Alimentación", pt: "Alimentação", de: "Fütterung", ja: "肥育", zh: "饲养" },
  "nav.sell": { en: "+ Sell", es: "+ Vender", pt: "+ Vender", de: "+ Verkaufen", ja: "+ 出品", zh: "+ 出售" },
  "nav.signin": { en: "Sign in", es: "Iniciar sesión", pt: "Entrar", de: "Anmelden", ja: "ログイン", zh: "登录" },
  "nav.signout": { en: "Sign out", es: "Cerrar sesión", pt: "Sair", de: "Abmelden", ja: "ログアウト", zh: "登出" },
  "nav.admin": { en: "⚙ Admin" },
  "nav.browseall": { en: "Browse all", es: "Ver todo", pt: "Ver tudo", de: "Alle ansehen", ja: "すべて見る", zh: "查看全部" },
  "nav.foundation": { en: "Foundation Bloodlines", es: "Linajes Fundadores", pt: "Linhagens Fundadoras", de: "Gründerlinien", ja: "基礎血統", zh: "基础血统" },
  "nav.browse_all_desc": { en: "Every listing", es: "Todas las publicaciones", pt: "Todos os anúncios", de: "Alle Anzeigen", ja: "すべての出品", zh: "所有列表" },
  "nav.foundation_desc": { en: "The founding sires & dams", es: "Sementales y madres fundadoras", pt: "Touros e matrizes fundadores", de: "Die Gründertiere", ja: "創始の種牛と繁殖牛", zh: "创始公牛与母牛" },
  "nav.marketdata_desc": { en: "Cattle & beef prices", es: "Precios de ganado y carne", pt: "Preços de gado e carne", de: "Rind- & Fleischpreise", ja: "牛・牛肉価格", zh: "牛与牛肉价格" },
  "nav.records_desc": { en: "Biggest sales ever", es: "Las mayores ventas", pt: "As maiores vendas", de: "Größte Verkäufe", ja: "史上最高額の販売", zh: "史上最高成交" },
  "nav.salereports_desc": { en: "Every auction, charted", es: "Cada subasta, en gráficos", pt: "Cada leilão, em gráficos", de: "Jede Auktion, grafisch", ja: "全オークションを図表化", zh: "每场拍卖，图表化" },
  "nav.semen_desc": { en: "Straws for sale", es: "Pajillas a la venta", pt: "Palhetas à venda", de: "Portionen zum Verkauf", ja: "販売中のストロー", zh: "在售冻精" },
  "nav.embryos_desc": { en: "Embryos for sale", es: "Embriones a la venta", pt: "Embriões à venda", de: "Embryonen zum Verkauf", ja: "販売中の受精卵", zh: "在售胚胎" },
  "nav.cloning_desc": { en: "Cloning rights", es: "Derechos de clonación", pt: "Direitos de clonagem", de: "Klonrechte", ja: "クローン権", zh: "克隆权" },
  "hero.eyebrow": { en: "🥩 THE GLOBAL WAGYU CROSSROADS", es: "🥩 EL CRUCE GLOBAL DEL WAGYU", pt: "🥩 O CRUZAMENTO GLOBAL DO WAGYU", de: "🥩 DER GLOBALE WAGYU-KNOTENPUNKT", ja: "🥩 世界の和牛クロスロード", zh: "🥩 全球和牛交汇点" },
  "hero.title": {
    en: "The world's marketplace & knowledge hub for Wagyu genetics.",
    es: "El mercado y centro de conocimiento mundial de la genética Wagyu.",
    pt: "O mercado e centro de conhecimento mundial da genética Wagyu.",
    de: "Der weltweite Marktplatz & Wissenszentrum für Wagyu-Genetik.",
    ja: "和牛遺伝資源の世界的マーケットプレイス＆知識拠点。",
    zh: "全球和牛遗传资源的交易市场与知识中心。",
  },
  "hero.sub": {
    en: "Buy and sell semen, embryos, and cloning rights — and explore the deepest breed history, a live price index, and bloodlines traced to the original foundation sires. List in under a minute. Free.",
    es: "Compra y vende semen, embriones y derechos de clonación — y explora la historia más profunda de la raza, un índice de precios en vivo y linajes que se remontan a los sementales fundadores. Publica en menos de un minuto. Gratis.",
    pt: "Compre e venda sêmen, embriões e direitos de clonagem — e explore a mais profunda história da raça, um índice de preços ao vivo e linhagens que remontam aos touros fundadores. Anuncie em menos de um minuto. Grátis.",
    de: "Kaufen und verkaufen Sie Sperma, Embryonen und Klonrechte — und entdecken Sie die tiefste Rassegeschichte, einen Live-Preisindex und Blutlinien bis zu den Gründertieren. In unter einer Minute inserieren. Kostenlos.",
    ja: "精液・受精卵・クローン権の売買。品種の詳細な歴史、リアルタイム価格指数、創始種牛までさかのぼる血統も。1分以内で出品、無料。",
    zh: "买卖精液、胚胎和克隆权——探索最深入的品种历史、实时价格指数，以及可追溯到创始公牛的血统。一分钟内即可发布，免费。",
  },
  "hero.search": { en: "Search a sire, bloodline, or registration number…", es: "Busca un semental, linaje o número de registro…", pt: "Busque um touro, linhagem ou número de registro…", de: "Suche nach Bulle, Blutlinie oder Registriernummer…", ja: "種雄牛・血統・登録番号で検索…", zh: "搜索公牛、血统或登记号…" },
  "hero.list": { en: "List your genetics →", es: "Publica tu genética →", pt: "Anuncie sua genética →", de: "Genetik inserieren →", ja: "遺伝資源を出品 →", zh: "发布您的遗传资源 →" },
  "hero.explore": { en: "Explore the breed history", es: "Explora la historia de la raza", pt: "Explore a história da raça", de: "Rassegeschichte entdecken", ja: "品種の歴史を見る", zh: "探索品种历史" },
  "home.wire": { en: "📰 The Wagyu Wire", es: "📰 El Cable Wagyu", pt: "📰 O Fio Wagyu", de: "📰 Der Wagyu-Draht", ja: "📰 和牛ワイヤー", zh: "📰 和牛快讯" },
  "home.roundup": { en: "📡 The Roundup", es: "📡 La Recopilación", pt: "📡 A Compilação", de: "📡 Die Übersicht", ja: "📡 まとめ", zh: "📡 汇总" },
  "home.allnews": { en: "All news →", es: "Todas las noticias →", pt: "Todas as notícias →", de: "Alle Nachrichten →", ja: "すべてのニュース →", zh: "全部新闻 →" },
  "home.allweb": { en: "All web listings →", es: "Todas las publicaciones web →", pt: "Todos os anúncios web →", de: "Alle Web-Anzeigen →", ja: "すべてのウェブ出品 →", zh: "全部网络列表 →" },
  "home.wire_sub": {
    en: "Global Wagyu headlines — including Japanese reporting translated into English, found nowhere else.",
    es: "Titulares Wagyu de todo el mundo — incluyendo reportajes japoneses traducidos, que no encontrarás en ningún otro lugar.",
    pt: "Manchetes Wagyu do mundo todo — incluindo reportagens japonesas traduzidas, que você não encontra em nenhum outro lugar.",
    de: "Globale Wagyu-Schlagzeilen — inklusive übersetzter japanischer Berichte, die es sonst nirgends gibt.",
    ja: "世界の和牛ニュース — 他では読めない日本語報道の翻訳も。",
    zh: "全球和牛头条——包括别处找不到的日本报道翻译。",
  },
  "home.roundup_sub": {
    en: "Wagyu genetics for sale from across the web, gathered in one place. Not WagyuTank sellers — each links back to the original listing.",
    es: "Genética Wagyu a la venta de toda la web, reunida en un solo lugar. No son vendedores de WagyuTank — cada uno enlaza a la publicación original.",
    pt: "Genética Wagyu à venda de toda a web, reunida em um só lugar. Não são vendedores da WagyuTank — cada um leva ao anúncio original.",
    de: "Wagyu-Genetik zum Verkauf aus dem ganzen Web, an einem Ort. Keine WagyuTank-Verkäufer — jede verlinkt zur Originalanzeige.",
    ja: "ウェブ全体の和牛遺伝資源を一箇所に集約。WagyuTankの出品ではなく、各元の掲載元へリンクします。",
    zh: "汇集全网在售的和牛遗传资源。非 WagyuTank 卖家——每条均链接至原始信息。",
  },
  "common.search": { en: "Search", es: "Buscar", pt: "Buscar", de: "Suchen", ja: "検索", zh: "搜索" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("wt_lang")) as Lang | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
  }, []);
  function setLang(l: Lang) { setLangState(l); try { localStorage.setItem("wt_lang", l); } catch {} }
  const t = (key: string) => { const row = K[key]; return (row && (row[lang] ?? row.en)) ?? key; };
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
