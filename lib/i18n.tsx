"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang =
  | "en" | "es" | "pt" | "de" | "ja" | "zh"
  | "fr" | "it" | "ko" | "tr" | "cs" | "pl" | "hu" | "id";

export const LANGUAGES: { code: Lang; label: string; flag: string; english: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸", english: "English" },
  { code: "es", label: "Español", flag: "🇪🇸", english: "Spanish" },
  { code: "pt", label: "Português", flag: "🇧🇷", english: "Portuguese" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", english: "German" },
  { code: "ja", label: "日本語", flag: "🇯🇵", english: "Japanese" },
  { code: "zh", label: "中文", flag: "🇨🇳", english: "Chinese" },
  // 2026-07-28 expansion to 14. Ordered roughly by the size of the language
  // barrier they remove, not by listing count.
  { code: "fr", label: "Français", flag: "🇫🇷", english: "French" },
  { code: "it", label: "Italiano", flag: "🇮🇹", english: "Italian" },
  { code: "ko", label: "한국어", flag: "🇰🇷", english: "Korean" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", english: "Turkish" },
  { code: "cs", label: "Čeština", flag: "🇨🇿", english: "Czech" },
  { code: "pl", label: "Polski", flag: "🇵🇱", english: "Polish" },
  { code: "hu", label: "Magyar", flag: "🇭🇺", english: "Hungarian" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩", english: "Indonesian" },
];

// Each key maps lang→string. Missing langs fall back to English.
export const K: Record<string, Partial<Record<Lang, string>>> = {
  "nav.browse": { en: "Browse", es: "Explorar", pt: "Explorar", de: "Durchsuchen", ja: "見る", zh: "浏览", fr: "Parcourir", it: "Esplora", ko: "둘러보기", tr: "Gözat", cs: "Procházet", pl: "Przeglądaj", hu: "Böngészés", id: "Jelajahi" },
  "nav.semen": { en: "Semen", es: "Semen", pt: "Sêmen", de: "Sperma", ja: "精液", zh: "精液", fr: "Semence", it: "Seme", ko: "정액", tr: "Sperma", cs: "Sperma", pl: "Nasienie", hu: "Sperma", id: "Semen" },
  "nav.embryos": { en: "Embryos", es: "Embriones", pt: "Embriões", de: "Embryonen", ja: "受精卵", zh: "胚胎", fr: "Embryons", it: "Embrioni", ko: "수정란", tr: "Embriyolar", cs: "Embrya", pl: "Zarodki", hu: "Embriók", id: "Embrio" },
  "nav.cloning": { en: "Cloning", es: "Clonación", pt: "Clonagem", de: "Klonen", ja: "クローン", zh: "克隆", fr: "Clonage", it: "Clonazione", ko: "복제", tr: "Klonlama", cs: "Klonování", pl: "Klonowanie", hu: "Klónozás", id: "Kloning" },
  "nav.roundup": { en: "Roundup", es: "Recopilación", pt: "Compilação", de: "Übersicht", ja: "まとめ", zh: "汇总", fr: "Rassemblement", it: "Rassegna", ko: "라운드업", tr: "Derleme", cs: "Souhrn", pl: "Przegląd", hu: "Összefoglaló", id: "Roundup" },
  "nav.news": { en: "News", es: "Noticias", pt: "Notícias", de: "Nachrichten", ja: "ニュース", zh: "新闻", fr: "Actualités", it: "Notizie", ko: "뉴스", tr: "Haberler", cs: "Novinky", pl: "Aktualności", hu: "Hírek", id: "Berita" },
  "nav.market": { en: "Market", es: "Mercado", pt: "Mercado", de: "Markt", ja: "市場", zh: "市场", fr: "Marché", it: "Mercato", ko: "시장", tr: "Piyasa", cs: "Trh", pl: "Rynek", hu: "Piac", id: "Pasar" },
  "nav.marketdata": { en: "Market Data", es: "Datos de Mercado", pt: "Dados de Mercado", de: "Marktdaten", ja: "市場データ", zh: "市场数据", fr: "Données de marché", it: "Dati di mercato", ko: "시장 데이터", tr: "Piyasa Verileri", cs: "Tržní data", pl: "Dane rynkowe", hu: "Piaci adatok", id: "Data Pasar" },
  "nav.records": { en: "Record Sales", es: "Ventas Récord", pt: "Vendas Recordes", de: "Rekordverkäufe", ja: "最高額販売", zh: "纪录成交", fr: "Ventes records", it: "Vendite record", ko: "최고가 거래", tr: "Rekor Satışlar", cs: "Rekordní prodeje", pl: "Rekordowe sprzedaże", hu: "Rekordeladások", id: "Rekor Penjualan" },
  "nav.salereports": { en: "Sale Reports", es: "Informes de Venta", pt: "Relatórios de Venda", de: "Verkaufsberichte", ja: "販売レポート", zh: "拍卖报告", fr: "Rapports de vente", it: "Report vendite", ko: "경매 리포트", tr: "Satış Raporları", cs: "Zprávy z aukcí", pl: "Raporty sprzedaży", hu: "Aukciós jelentések", id: "Laporan Penjualan" },
  "nav.data": { en: "Data", es: "Datos", pt: "Dados", de: "Daten", ja: "データ", zh: "数据", fr: "Données", it: "Dati", ko: "데이터", tr: "Veriler", cs: "Data", pl: "Dane", hu: "Adatok", id: "Data" },
  "nav.history": { en: "Breed History", es: "Historia de la Raza", pt: "História da Raça", de: "Rassegeschichte", ja: "品種の歴史", zh: "品种历史", fr: "Histoire de la race", it: "Storia della razza", ko: "품종 역사", tr: "Irk Tarihi", cs: "Historie plemene", pl: "Historia rasy", hu: "Fajtatörténet", id: "Sejarah Bangsa" },
  "nav.help": { en: "Help", es: "Ayuda", pt: "Ajuda", de: "Hilfe", ja: "ヘルプ", zh: "帮助", fr: "Aide", it: "Aiuto", ko: "도움말", tr: "Yardım", cs: "Nápověda", pl: "Pomoc", hu: "Súgó", id: "Bantuan" },
  "nav.directory": { en: "Directory", es: "Directorio", pt: "Diretório", de: "Verzeichnis", ja: "名鑑", zh: "名录", fr: "Annuaire", it: "Elenco", ko: "디렉터리", tr: "Rehber", cs: "Adresář", pl: "Spis firm", hu: "Címtár", id: "Direktori" },
  "nav.advertise": { en: "Advertise", es: "Anunciar", pt: "Anunciar", de: "Werben", ja: "広告", zh: "广告", fr: "Annoncer", it: "Pubblicità", ko: "광고 문의", tr: "Reklam Ver", cs: "Inzerce", pl: "Reklama", hu: "Hirdetés", id: "Pasang Iklan" },
  "nav.catalog": { en: "Catalog", es: "Catálogo", pt: "Catálogo", de: "Katalog", ja: "カタログ", zh: "目录", fr: "Catalogue", it: "Catalogo", ko: "카탈로그", tr: "Katalog", cs: "Katalog", pl: "Katalog", hu: "Katalógus", id: "Katalog" },
  "nav.videos": { en: "Videos", es: "Videos", pt: "Vídeos", de: "Videos", ja: "動画", zh: "视频", fr: "Vidéos", it: "Video", ko: "동영상", tr: "Videolar", cs: "Videa", pl: "Filmy", hu: "Videók", id: "Video" },
  "nav.japan": { en: "🇯🇵 Japan", es: "🇯🇵 Japón", pt: "🇯🇵 Japão", de: "🇯🇵 Japan", ja: "🇯🇵 日本", zh: "🇯🇵 日本", fr: "🇯🇵 Japon", it: "🇯🇵 Giappone", ko: "🇯🇵 일본", tr: "🇯🇵 Japonya", cs: "🇯🇵 Japonsko", pl: "🇯🇵 Japonia", hu: "🇯🇵 Japán", id: "🇯🇵 Jepang" },
  "nav.feeding": { en: "Feeding", es: "Alimentación", pt: "Alimentação", de: "Fütterung", ja: "肥育", zh: "饲养", fr: "Alimentation", it: "Alimentazione", ko: "사양 관리", tr: "Besleme", cs: "Krmení", pl: "Żywienie", hu: "Takarmányozás", id: "Pakan" },
  "nav.sell": { en: "+ Sell", es: "+ Vender", pt: "+ Vender", de: "+ Verkaufen", ja: "+ 出品", zh: "+ 出售", fr: "+ Vendre", it: "+ Vendi", ko: "+ 판매하기", tr: "+ Sat", cs: "+ Prodat", pl: "+ Sprzedaj", hu: "+ Eladás", id: "+ Jual" },
  "nav.signin": { en: "Sign in", es: "Iniciar sesión", pt: "Entrar", de: "Anmelden", ja: "ログイン", zh: "登录", fr: "Se connecter", it: "Accedi", ko: "로그인", tr: "Giriş yap", cs: "Přihlásit se", pl: "Zaloguj się", hu: "Bejelentkezés", id: "Masuk" },
  "nav.signout": { en: "Sign out", es: "Cerrar sesión", pt: "Sair", de: "Abmelden", ja: "ログアウト", zh: "登出", fr: "Se déconnecter", it: "Esci", ko: "로그아웃", tr: "Çıkış yap", cs: "Odhlásit se", pl: "Wyloguj się", hu: "Kijelentkezés", id: "Keluar" },
  // Admin-only UI — deliberately English-only; never shown to members.
  "nav.admin": { en: "⚙ Admin" },
  "nav.browseall": { en: "Browse all", es: "Ver todo", pt: "Ver tudo", de: "Alle ansehen", ja: "すべて見る", zh: "查看全部", fr: "Tout parcourir", it: "Vedi tutti", ko: "전체 보기", tr: "Tümünü gör", cs: "Procházet vše", pl: "Przeglądaj wszystko", hu: "Összes böngészése", id: "Jelajahi semua" },
  "nav.foundation": { en: "Foundation Bloodlines", es: "Linajes Fundadores", pt: "Linhagens Fundadoras", de: "Gründerlinien", ja: "基礎血統", zh: "基础血统", fr: "Lignées fondatrices", it: "Linee di sangue fondatrici", ko: "기초 혈통", tr: "Temel Kan Hatları", cs: "Zakladatelské linie", pl: "Linie założycielskie", hu: "Alapító vérvonalak", id: "Galur Induk Foundation" },
  "nav.browse_all_desc": { en: "Every listing", es: "Todas las publicaciones", pt: "Todos os anúncios", de: "Alle Anzeigen", ja: "すべての出品", zh: "所有列表", fr: "Toutes les annonces", it: "Tutti gli annunci", ko: "모든 매물", tr: "Tüm ilanlar", cs: "Všechny nabídky", pl: "Wszystkie ogłoszenia", hu: "Minden hirdetés", id: "Semua listing" },
  "nav.foundation_desc": { en: "The founding sires & dams", es: "Sementales y madres fundadoras", pt: "Touros e matrizes fundadores", de: "Die Gründertiere", ja: "創始の種牛と繁殖牛", zh: "创始公牛与母牛", fr: "Les taureaux et vaches fondateurs", it: "I tori e le vacche fondatori", ko: "기초 종모우 및 종빈우", tr: "Kurucu boğalar ve inekler", cs: "Zakladatelští býci a krávy", pl: "Buhaje i krowy założycielskie", hu: "Az alapító bikák és tehenek", id: "Para pejantan & induk pendiri" },
  "nav.marketdata_desc": { en: "Cattle & beef prices", es: "Precios de ganado y carne", pt: "Preços de gado e carne", de: "Rind- & Fleischpreise", ja: "牛・牛肉価格", zh: "牛与牛肉价格", fr: "Cours du bétail et du bœuf", it: "Prezzi dei bovini e della carne", ko: "소·소고기 시세", tr: "Sığır ve et fiyatları", cs: "Ceny skotu a hovězího", pl: "Ceny bydła i wołowiny", hu: "Szarvasmarha- és marhahúsárak", id: "Harga sapi & daging sapi" },
  "nav.records_desc": { en: "Biggest sales ever", es: "Las mayores ventas", pt: "As maiores vendas", de: "Größte Verkäufe", ja: "史上最高額の販売", zh: "史上最高成交", fr: "Les plus grosses ventes de l'histoire", it: "Le vendite più alte di sempre", ko: "역대 최고 거래가", tr: "Tüm zamanların en büyük satışları", cs: "Největší prodeje všech dob", pl: "Największe sprzedaże w historii", hu: "A valaha volt legnagyobb eladások", id: "Penjualan terbesar sepanjang masa" },
  "nav.salereports_desc": { en: "Every auction, charted", es: "Cada subasta, en gráficos", pt: "Cada leilão, em gráficos", de: "Jede Auktion, grafisch", ja: "全オークションを図表化", zh: "每场拍卖，图表化", fr: "Chaque vente aux enchères, en graphiques", it: "Ogni asta, in grafici", ko: "모든 경매를 차트로", tr: "Her müzayede, grafiklerle", cs: "Každá aukce v grafech", pl: "Każda aukcja na wykresach", hu: "Minden aukció, grafikonon", id: "Setiap lelang, dalam grafik" },
  "nav.semen_desc": { en: "Straws for sale", es: "Pajillas a la venta", pt: "Palhetas à venda", de: "Portionen zum Verkauf", ja: "販売中のストロー", zh: "在售冻精", fr: "Paillettes à vendre", it: "Paillette in vendita", ko: "판매 중인 스트로", tr: "Satılık payetler", cs: "Pejety na prodej", pl: "Słomki na sprzedaż", hu: "Eladó pajetták", id: "Straw yang dijual" },
  "nav.embryos_desc": { en: "Embryos for sale", es: "Embriones a la venta", pt: "Embriões à venda", de: "Embryonen zum Verkauf", ja: "販売中の受精卵", zh: "在售胚胎", fr: "Embryons à vendre", it: "Embrioni in vendita", ko: "판매 중인 수정란", tr: "Satılık embriyolar", cs: "Embrya na prodej", pl: "Zarodki na sprzedaż", hu: "Eladó embriók", id: "Embrio yang dijual" },
  "nav.cloning_desc": { en: "Cloning rights", es: "Derechos de clonación", pt: "Direitos de clonagem", de: "Klonrechte", ja: "クローン権", zh: "克隆权", fr: "Droits de clonage", it: "Diritti di clonazione", ko: "복제 권리", tr: "Klonlama hakları", cs: "Práva ke klonování", pl: "Prawa do klonowania", hu: "Klónozási jogok", id: "Hak kloning" },
  "hero.eyebrow": { en: "🥩 THE GLOBAL WAGYU CROSSROADS", es: "🥩 EL CRUCE GLOBAL DEL WAGYU", pt: "🥩 O CRUZAMENTO GLOBAL DO WAGYU", de: "🥩 DER GLOBALE WAGYU-KNOTENPUNKT", ja: "🥩 世界の和牛クロスロード", zh: "🥩 全球和牛交汇点", fr: "🥩 LE CARREFOUR MONDIAL DU WAGYU", it: "🥩 IL CROCEVIA GLOBALE DEL WAGYU", ko: "🥩 글로벌 와규의 교차로", tr: "🥩 KÜRESEL WAGYU KAVŞAĞI", cs: "🥩 GLOBÁLNÍ KŘIŽOVATKA WAGYU", pl: "🥩 ŚWIATOWE CENTRUM WAGYU", hu: "🥩 A GLOBÁLIS WAGYU CSOMÓPONT", id: "🥩 PERSIMPANGAN WAGYU DUNIA" },
  "hero.title": {
    en: "The world's marketplace & knowledge hub for Wagyu genetics.",
    es: "El mercado y centro de conocimiento mundial de la genética Wagyu.",
    pt: "O mercado e centro de conhecimento mundial da genética Wagyu.",
    de: "Der weltweite Marktplatz & Wissenszentrum für Wagyu-Genetik.",
    ja: "和牛遺伝資源の世界的マーケットプレイス＆知識拠点。",
    zh: "全球和牛遗传资源的交易市场与知识中心。",
    fr: "La place de marché et le centre de connaissances mondial de la génétique Wagyu.",
    it: "Il marketplace mondiale e il centro di conoscenza per la genetica Wagyu.",
    ko: "Wagyu 유전자원을 위한 세계 최고의 마켓플레이스이자 지식 허브.",
    tr: "Wagyu genetiğinin dünya pazarı ve bilgi merkezi.",
    cs: "Světové tržiště a znalostní centrum pro genetiku Wagyu.",
    pl: "Światowy rynek i baza wiedzy o genetyce Wagyu.",
    hu: "A világ Wagyu-genetikai piactere és tudásközpontja.",
    id: "Marketplace & pusat pengetahuan genetika Wagyu dunia.",
  },
  "hero.sub": {
    en: "Buy and sell semen, embryos, and cloning rights — and explore the deepest breed history, a live price index, and bloodlines traced to the original foundation sires. List in under a minute. Free.",
    es: "Compra y vende semen, embriones y derechos de clonación — y explora la historia más profunda de la raza, un índice de precios en vivo y linajes que se remontan a los sementales fundadores. Publica en menos de un minuto. Gratis.",
    pt: "Compre e venda sêmen, embriões e direitos de clonagem — e explore a mais profunda história da raça, um índice de preços ao vivo e linhagens que remontam aos touros fundadores. Anuncie em menos de um minuto. Grátis.",
    de: "Kaufen und verkaufen Sie Sperma, Embryonen und Klonrechte — und entdecken Sie die tiefste Rassegeschichte, einen Live-Preisindex und Blutlinien bis zu den Gründertieren. In unter einer Minute inserieren. Kostenlos.",
    ja: "精液・受精卵・クローン権の売買。品種の詳細な歴史、リアルタイム価格指数、創始種牛までさかのぼる血統も。1分以内で出品、無料。",
    zh: "买卖精液、胚胎和克隆权——探索最深入的品种历史、实时价格指数，以及可追溯到创始公牛的血统。一分钟内即可发布，免费。",
    fr: "Achetez et vendez paillettes, embryons et droits de clonage — et explorez l'histoire de la race la plus complète, un indice de prix en direct et des lignées retracées jusqu'aux taureaux fondateurs d'origine. Publiez une annonce en moins d'une minute. Gratuit.",
    it: "Compra e vendi paillette, embrioni e diritti di clonazione — ed esplora la storia più approfondita della razza, un indice dei prezzi in tempo reale e linee di sangue tracciate fino ai tori fondatori originali. Pubblica un annuncio in meno di un minuto. Gratis.",
    ko: "정액, 수정란, 복제 권리를 사고팔고 — 가장 깊이 있는 품종 역사, 실시간 가격 지수, 그리고 원조 기초 종모우까지 거슬러 올라가는 혈통을 살펴보세요. 1분 안에 등록 완료. 무료입니다.",
    tr: "Sperma, embriyo ve klonlama hakkı alın ve satın; ayrıca ırkın en kapsamlı tarihini, canlı fiyat endeksini ve orijinal kurucu boğalara kadar izlenen kan hatlarını keşfedin. Bir dakikadan kısa sürede ilan verin. Ücretsiz.",
    cs: "Kupujte a prodávejte pejety, embrya a práva ke klonování — a objevte nejpodrobnější historii plemene, živý cenový index a krevní linie sledované až k původním zakladatelským býkům. Inzerát vytvoříte do minuty. Zdarma.",
    pl: "Kupuj i sprzedawaj nasienie, zarodki i prawa do klonowania — poznaj najbogatszą historię rasy, aktualny indeks cen i rodowody sięgające pierwotnych buhajów założycielskich. Wystaw ogłoszenie w niecałą minutę. Za darmo.",
    hu: "Vásároljon és adjon el pajettát, embriót és klónozási jogot – fedezze fel a fajta legrészletesebb történetét, az élő árindexet és az eredeti alapító bikákig visszavezetett vérvonalakat. Hirdetésfeladás egy percen belül. Ingyenes.",
    id: "Jual dan beli semen, embrio, serta hak kloning — dan telusuri sejarah bangsa sapi paling mendalam, indeks harga langsung, serta garis darah yang terlacak hingga pejantan pendiri asli. Pasang listing dalam kurang dari satu menit. Gratis.",
  },
  "hero.search": { en: "Search a sire, bloodline, or registration number…", es: "Busca un semental, linaje o número de registro…", pt: "Busque um touro, linhagem ou número de registro…", de: "Suche nach Bulle, Blutlinie oder Registriernummer…", ja: "種雄牛・血統・登録番号で検索…", zh: "搜索公牛、血统或登记号…", fr: "Rechercher un taureau, une lignée ou un numéro d'enregistrement…", it: "Cerca un toro, una linea di sangue o un numero di registrazione…", ko: "종모우, 혈통 또는 등록번호 검색…", tr: "Boğa, kan hattı veya kayıt numarası arayın…", cs: "Hledejte býka, krevní linii nebo registrační číslo…", pl: "Szukaj buhaja, linii krwi lub numeru rejestracyjnego…", hu: "Keressen bikát, vérvonalat vagy törzskönyvi számot…", id: "Cari pejantan, garis darah, atau nomor registrasi…" },
  "hero.list": { en: "List your genetics →", es: "Publica tu genética →", pt: "Anuncie sua genética →", de: "Genetik inserieren →", ja: "遺伝資源を出品 →", zh: "发布您的遗传资源 →", fr: "Publiez vos génétiques →", it: "Pubblica la tua genetica →", ko: "내 유전자원 등록하기 →", tr: "Genetiğinizi ilana çıkarın →", cs: "Nabídněte svou genetiku →", pl: "Wystaw swoją genetykę →", hu: "Hirdesse meg genetikáját →", id: "Pasang genetika Anda →" },
  "hero.explore": { en: "Explore the breed history", es: "Explora la historia de la raza", pt: "Explore a história da raça", de: "Rassegeschichte entdecken", ja: "品種の歴史を見る", zh: "探索品种历史", fr: "Explorer l'histoire de la race", it: "Esplora la storia della razza", ko: "품종 역사 살펴보기", tr: "Irkın tarihini keşfedin", cs: "Prozkoumat historii plemene", pl: "Poznaj historię rasy", hu: "Fedezze fel a fajta történetét", id: "Jelajahi sejarah bangsa Wagyu" },
  "home.wire": { en: "📰 The Wagyu Wire", es: "📰 El Cable Wagyu", pt: "📰 O Fio Wagyu", de: "📰 Der Wagyu-Draht", ja: "📰 和牛ワイヤー", zh: "📰 和牛快讯", fr: "📰 Le Fil Wagyu", it: "📰 Il Wagyu Wire", ko: "📰 The Wagyu Wire", tr: "📰 Wagyu Haber Hattı", cs: "📰 The Wagyu Wire", pl: "📰 Depesze Wagyu", hu: "📰 A Wagyu Híradó", id: "📰 The Wagyu Wire" },
  "home.roundup": { en: "📡 The Roundup", es: "📡 La Recopilación", pt: "📡 A Compilação", de: "📡 Die Übersicht", ja: "📡 まとめ", zh: "📡 汇总", fr: "📡 Le Tour d'horizon", it: "📡 La Rassegna", ko: "📡 The Roundup", tr: "📡 Derleme", cs: "📡 Souhrn z webu", pl: "📡 Przegląd", hu: "📡 A Körkép", id: "📡 The Roundup" },
  "home.allnews": { en: "All news →", es: "Todas las noticias →", pt: "Todas as notícias →", de: "Alle Nachrichten →", ja: "すべてのニュース →", zh: "全部新闻 →", fr: "Toute l'actualité →", it: "Tutte le notizie →", ko: "뉴스 전체 보기 →", tr: "Tüm haberler →", cs: "Všechny zprávy →", pl: "Wszystkie wiadomości →", hu: "Minden hír →", id: "Semua berita →" },
  "home.allweb": { en: "All web listings →", es: "Todas las publicaciones web →", pt: "Todos os anúncios web →", de: "Alle Web-Anzeigen →", ja: "すべてのウェブ出品 →", zh: "全部网络列表 →", fr: "Toutes les annonces du web →", it: "Tutti gli annunci dal web →", ko: "웹 매물 전체 보기 →", tr: "Tüm web ilanları →", cs: "Všechny nabídky z webu →", pl: "Wszystkie ogłoszenia z sieci →", hu: "Minden webes hirdetés →", id: "Semua listing web →" },
  "home.wire_sub": {
    en: "Global Wagyu headlines — including Japanese reporting translated into English, found nowhere else.",
    es: "Titulares Wagyu de todo el mundo — incluyendo reportajes japoneses traducidos, que no encontrarás en ningún otro lugar.",
    pt: "Manchetes Wagyu do mundo todo — incluindo reportagens japonesas traduzidas, que você não encontra em nenhum outro lugar.",
    de: "Globale Wagyu-Schlagzeilen — inklusive übersetzter japanischer Berichte, die es sonst nirgends gibt.",
    ja: "世界の和牛ニュース — 他では読めない日本語報道の翻訳も。",
    zh: "全球和牛头条——包括别处找不到的日本报道翻译。",
    fr: "L'actualité Wagyu du monde entier — y compris des articles japonais traduits en anglais, introuvables ailleurs.",
    it: "Notizie Wagyu da tutto il mondo — inclusi articoli giapponesi tradotti in inglese, introvabili altrove.",
    ko: "전 세계 Wagyu 헤드라인 — 다른 곳에서는 볼 수 없는 일본 현지 보도의 영문 번역까지.",
    tr: "Küresel Wagyu manşetleri — başka hiçbir yerde bulunmayan, İngilizceye çevrilmiş Japon haberleri dahil.",
    cs: "Světové titulky o Wagyu — včetně japonského zpravodajství přeloženého do angličtiny, které jinde nenajdete.",
    pl: "Wiadomości o Wagyu z całego świata — w tym japońskie doniesienia przetłumaczone na angielski, niedostępne nigdzie indziej.",
    hu: "Globális Wagyu-hírek – köztük angolra fordított japán tudósítások, amelyek máshol nem érhetők el.",
    id: "Berita utama Wagyu dari seluruh dunia — termasuk laporan Jepang yang diterjemahkan ke bahasa Inggris, tidak ada di tempat lain.",
  },
  "home.roundup_sub": {
    en: "Wagyu genetics for sale from across the web, gathered in one place. Not WagyuTank sellers — each links back to the original listing.",
    es: "Genética Wagyu a la venta de toda la web, reunida en un solo lugar. No son vendedores de WagyuTank — cada uno enlaza a la publicación original.",
    pt: "Genética Wagyu à venda de toda a web, reunida em um só lugar. Não são vendedores da WagyuTank — cada um leva ao anúncio original.",
    de: "Wagyu-Genetik zum Verkauf aus dem ganzen Web, an einem Ort. Keine WagyuTank-Verkäufer — jede verlinkt zur Originalanzeige.",
    ja: "ウェブ全体の和牛遺伝資源を一箇所に集約。WagyuTankの出品ではなく、各元の掲載元へリンクします。",
    zh: "汇集全网在售的和牛遗传资源。非 WagyuTank 卖家——每条均链接至原始信息。",
    fr: "De la génétique Wagyu à vendre partout sur le web, rassemblée en un seul endroit. Ce ne sont pas des vendeurs WagyuTank — chaque annonce renvoie à l'annonce d'origine.",
    it: "Genetica Wagyu in vendita da tutto il web, raccolta in un unico posto. Non sono venditori WagyuTank: ogni annuncio rimanda all'inserzione originale.",
    ko: "웹 곳곳의 Wagyu 유전자원 매물을 한곳에 모았습니다. WagyuTank 판매자가 아니며, 각 항목은 원본 매물로 연결됩니다.",
    tr: "İnternetin dört bir yanındaki satılık Wagyu genetiği tek bir yerde. Bunlar WagyuTank satıcıları değildir; her biri orijinal ilana bağlantı verir.",
    cs: "Genetika Wagyu na prodej z celého webu, shromážděná na jednom místě. Nejde o prodejce WagyuTank — každá položka odkazuje na původní inzerát.",
    pl: "Genetyka Wagyu na sprzedaż z całej sieci, zebrana w jednym miejscu. To nie są sprzedawcy WagyuTank — każde ogłoszenie odsyła do oryginalnego źródła.",
    hu: "Eladó Wagyu-genetika a web minden tájáról, egy helyen összegyűjtve. Nem WagyuTank-eladók – mindegyik az eredeti hirdetésre mutat vissza.",
    id: "Genetika Wagyu yang dijual dari berbagai situs, dikumpulkan di satu tempat. Bukan penjual WagyuTank — setiap tautan mengarah ke listing aslinya.",
  },
  "common.search": { en: "Search", es: "Buscar", pt: "Buscar", de: "Suchen", ja: "検索", zh: "搜索", fr: "Rechercher", it: "Cerca", ko: "검색", tr: "Ara", cs: "Hledat", pl: "Szukaj", hu: "Keresés", id: "Cari" },
  "nav.newsletter": { en: "Newsletter", es: "Boletín", pt: "Boletim", de: "Newsletter", ja: "ニュースレター", zh: "订阅", fr: "Newsletter", it: "Newsletter", ko: "뉴스레터", tr: "Bülten", cs: "Newsletter", pl: "Newsletter", hu: "Hírlevél", id: "Buletin" },
  "nav.greatsires": { en: "Great Sires", es: "Grandes Sementales", pt: "Grandes Touros", de: "Große Bullen", ja: "偉大な種牛", zh: "伟大种牛", fr: "Grands Taureaux", it: "Grandi Tori", ko: "명종모우", tr: "Büyük Boğalar", cs: "Významní býci", pl: "Wielkie Buhaje", hu: "Nagy tenyészbikák", id: "Pejantan Hebat" },
  "nav.greatsires_desc": { en: "The encyclopedia of the breed's most influential bulls and dams", es: "La enciclopedia de los toros y vacas más influyentes de la raza", pt: "A enciclopédia dos touros e matrizes mais influentes da raça", de: "Die Enzyklopädie der einflussreichsten Bullen und Kühe der Rasse", ja: "品種で最も影響力のある種牛と繁殖牛の百科事典", zh: "本品种最具影响力公牛与母牛的百科全书", fr: "L'encyclopédie des taureaux et vaches les plus influents de la race", it: "L'enciclopedia dei tori e delle vacche più influenti della razza", ko: "품종에 가장 큰 영향을 끼친 종모우와 종빈우의 백과사전", tr: "Irkın en etkili boğa ve ineklerinin ansiklopedisi", cs: "Encyklopedie nejvlivnějších býků a krav plemene", pl: "Encyklopedia najbardziej wpływowych buhajów i krów rasy", hu: "A fajta legbefolyásosabb bikáinak és teheneinek enciklopédiája", id: "Ensiklopedia pejantan dan induk paling berpengaruh dalam bangsa Wagyu" },
  "nav.feed": { en: "Feed", es: "Tu feed", pt: "Seu feed", de: "Feed", ja: "フィード", zh: "动态", fr: "Fil", it: "Feed", ko: "피드", tr: "Akış", cs: "Feed", pl: "Aktualności", hu: "Hírfolyam", id: "Feed" },
  "nav.owner": { en: "Owner", es: "Propietario", pt: "Proprietário", de: "Inhaber", ja: "オーナー", zh: "所有者", fr: "Propriétaire", it: "Proprietario", ko: "소유자", tr: "Sahip", cs: "Majitel", pl: "Właściciel", hu: "Tulajdonos", id: "Pemilik" },
  "nav.manager": { en: "Manager", es: "Gerente", pt: "Gerente", de: "Manager", ja: "マネージャー", zh: "管理员", fr: "Gestionnaire", it: "Gestore", ko: "관리자", tr: "Yönetici", cs: "Správce", pl: "Menedżer", hu: "Menedzser", id: "Manajer" },
  "nav.more": { en: "More", es: "Más", pt: "Mais", de: "Mehr", ja: "その他", zh: "更多", fr: "Plus", it: "Altro", ko: "더보기", tr: "Daha fazla", cs: "Více", pl: "Więcej", hu: "Továbbiak", id: "Lainnya" },
  "nav.livecattle": { en: "Live cattle", es: "Ganado en pie", pt: "Gado vivo", de: "Lebendvieh", ja: "生体牛", zh: "活牛", fr: "Bovins vivants", it: "Bovini vivi", ko: "생우", tr: "Canlı sığır", cs: "Živý skot", pl: "Żywe bydło", hu: "Élő szarvasmarha", id: "Sapi hidup" },
  "nav.sec_market": { en: "The market", es: "El mercado", pt: "O mercado", de: "Der Markt", ja: "マーケット", zh: "市场", fr: "Le marché", it: "Il mercato", ko: "마켓", tr: "Pazar", cs: "Trh", pl: "Rynek", hu: "A piac", id: "Pasar" },
  "nav.sec_read": { en: "Read & watch", es: "Leer y ver", pt: "Ler e assistir", de: "Lesen & ansehen", ja: "読む・観る", zh: "阅读与观看", fr: "À lire et à voir", it: "Leggi e guarda", ko: "읽을거리 & 영상", tr: "Oku & izle", cs: "Číst a sledovat", pl: "Czytaj i oglądaj", hu: "Olvasás és videók", id: "Baca & tonton" },
  "nav.sec_account": { en: "Your account", es: "Tu cuenta", pt: "Sua conta", de: "Ihr Konto", ja: "アカウント", zh: "您的账户", fr: "Votre compte", it: "Il tuo account", ko: "내 계정", tr: "Hesabınız", cs: "Váš účet", pl: "Twoje konto", hu: "Az Ön fiókja", id: "Akun Anda" },

  // --- Trade terms of art. Pre-seeded into the auto-translator cache (see
  // AutoTranslate.cacheFor) so the machine translator NEVER gets a vote on them.
  // Every one of these was mistranslated on the live site: "Semen Straws" came
  // out as 精液管 (seminal duct) in Japanese and "Sperma-Strohhalme" (sperm
  // drinking-straws) in German; "Contact for price" as 僧価 (monk price).
  "term.semen_straws": { en: "Semen Straws", es: "Pajillas de semen", pt: "Palhetas de sêmen", de: "Samenportionen", ja: "精液ストロー", zh: "冻精细管", fr: "Paillettes de semence", it: "Paillette di seme", ko: "정액 스트로", tr: "Sperma Payetleri", cs: "Inseminační pejety", pl: "Słomki z nasieniem", hu: "Sperma pajetták", id: "Straw Semen" },
  "term.embryos": { en: "Embryos", es: "Embriones", pt: "Embriões", de: "Embryonen", ja: "受精卵", zh: "胚胎", fr: "Embryons", it: "Embrioni", ko: "수정란", tr: "Embriyolar", cs: "Embrya", pl: "Zarodki", hu: "Embriók", id: "Embrio" },
  "term.cloning_rights": { en: "Cloning Rights", es: "Derechos de clonación", pt: "Direitos de clonagem", de: "Klonrechte", ja: "クローン権", zh: "克隆权", fr: "Droits de clonage", it: "Diritti di clonazione", ko: "복제권", tr: "Klonlama Hakları", cs: "Práva ke klonování", pl: "Prawa do klonowania", hu: "Klónozási jogok", id: "Hak Kloning" },
  "term.per_straw": { en: "per straw", es: "por pajilla", pt: "por palheta", de: "pro Portion", ja: "1本あたり", zh: "每支", fr: "par paillette", it: "per paillette", ko: "스트로당", tr: "payet başına", cs: "za pejetu", pl: "za słomkę", hu: "pajettánként", id: "per straw" },
  // The price tickers render the bare unit token, not the "per straw" phrase.
  // Without these the German ticker read "/Strohhalm" — a drinking straw.
  "term.straw": { en: "straw", es: "pajilla", pt: "palheta", de: "Portion", ja: "本", zh: "支", fr: "paillette", it: "paillette", ko: "스트로", tr: "payet", cs: "pejeta", pl: "słomka", hu: "pajetta", id: "straw" },
  "term.slash_straw": { en: "/straw", es: "/pajilla", pt: "/palheta", de: "/Portion", ja: "/本", zh: "/支", fr: "/paillette", it: "/paillette", ko: "/스트로", tr: "/payet", cs: "/pejetu", pl: "/słomkę", hu: "/pajetta", id: "/straw" },
  "term.straws": { en: "straws", es: "pajillas", pt: "palhetas", de: "Portionen", ja: "本", zh: "支", fr: "paillettes", it: "paillette", ko: "스트로", tr: "payet", cs: "pejety", pl: "słomki", hu: "pajetta", id: "straw" },
  "term.per_embryo": { en: "per embryo", es: "por embrión", pt: "por embrião", de: "pro Embryo", ja: "1個あたり", zh: "每枚", fr: "par embryon", it: "per embrione", ko: "수정란당", tr: "embriyo başına", cs: "za embryo", pl: "za zarodek", hu: "embriónként", id: "per embrio" },
  "term.rights_fee": { en: "rights fee", es: "tarifa de derechos", pt: "taxa de direitos", de: "Lizenzgebühr", ja: "権利料", zh: "权利费", fr: "redevance de droits", it: "costo dei diritti", ko: "권리 사용료", tr: "hak bedeli", cs: "poplatek za práva", pl: "opłata za prawa", hu: "jogdíj", id: "biaya hak" },
  "term.in_stock": { en: "In stock", es: "Disponible", pt: "Disponível", de: "Auf Lager", ja: "在庫あり", zh: "有现货", fr: "En stock", it: "Disponibile", ko: "재고 있음", tr: "Stokta", cs: "Skladem", pl: "Dostępne", hu: "Raktáron", id: "Tersedia" },
  "term.contact_price": { en: "Contact for price", es: "Consultar precio", pt: "Consultar preço", de: "Preis auf Anfrage", ja: "価格はお問い合わせください", zh: "价格请咨询", fr: "Prix sur demande", it: "Prezzo su richiesta", ko: "가격 문의", tr: "Fiyat için iletişime geçin", cs: "Cena na dotaz", pl: "Cena na zapytanie", hu: "Árért lépjen kapcsolatba", id: "Hubungi untuk harga" },
  "term.beef_market": { en: "Beef Market", es: "Mercado de la carne", pt: "Mercado da carne", de: "Rindfleischmarkt", ja: "牛肉市場", zh: "牛肉市场", fr: "Marché du bœuf", it: "Mercato della carne", ko: "쇠고기 시장", tr: "Sığır Eti Piyasası", cs: "Trh s hovězím", pl: "Rynek wołowiny", hu: "Marhahúspiac", id: "Pasar Daging Sapi" },
  "term.genetics_index": { en: "Genetics Index", es: "Índice genético", pt: "Índice genético", de: "Genetik-Index", ja: "遺伝資源指数", zh: "遗传资源指数", fr: "Indice génétique", it: "Indice genetico", ko: "유전 지수", tr: "Genetik Endeksi", cs: "Index genetiky", pl: "Indeks genetyczny", hu: "Genetikai index", id: "Indeks Genetika" },
  "term.sale_data": { en: "Sale Data", es: "Datos de ventas", pt: "Dados de vendas", de: "Verkaufsdaten", ja: "販売データ", zh: "成交数据", fr: "Données de vente", it: "Dati di vendita", ko: "거래 데이터", tr: "Satış Verileri", cs: "Údaje o prodeji", pl: "Dane sprzedaży", hu: "Értékesítési adatok", id: "Data Penjualan" },
  "term.fresh_listings": { en: "Fresh listings", es: "Publicaciones recientes", pt: "Anúncios recentes", de: "Neue Anzeigen", ja: "新着の出品", zh: "最新发布", fr: "Nouvelles annonces", it: "Nuovi annunci", ko: "최신 매물", tr: "Yeni ilanlar", cs: "Nové nabídky", pl: "Nowe ogłoszenia", hu: "Friss hirdetések", id: "Listing terbaru" },
  "term.view_original": { en: "View original listing ↗", es: "Ver publicación original ↗", pt: "Ver anúncio original ↗", de: "Originalanzeige ansehen ↗", ja: "元の掲載を見る ↗", zh: "查看原始信息 ↗", fr: "Voir l'annonce d'origine ↗", it: "Vedi annuncio originale ↗", ko: "원본 매물 보기 ↗", tr: "Orijinal ilanı görüntüle ↗", cs: "Zobrazit původní inzerát ↗", pl: "Zobacz oryginalne ogłoszenie ↗", hu: "Eredeti hirdetés megtekintése ↗", id: "Lihat listing asli ↗" },
  "term.foundation_bulls": { en: "The foundation bulls", es: "Los toros fundadores", pt: "Os touros fundadores", de: "Die Gründerbullen", ja: "基礎種雄牛", zh: "基础种公牛", fr: "Les taureaux fondateurs", it: "I tori fondatori", ko: "기초 종모우", tr: "Temel boğalar", cs: "Zakladatelští býci", pl: "Buhaje założycielskie", hu: "Az alapító bikák", id: "Pejantan fondasi" },
  "term.progeny": { en: "progeny", es: "descendencia", pt: "progênie", de: "Nachkommen", ja: "産子数", zh: "后代", fr: "descendance", it: "progenie", ko: "후대", tr: "döl", cs: "potomstvo", pl: "potomstwo", hu: "utódok", id: "keturunan" },
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
  // Only the nav uses the instant phrasebook — and the nav lives entirely inside
  // the data-noloc <header>, so the whole-page auto-translator never touches it.
  // Everything else returns English and is handled by the auto-translator, so the
  // two systems never fight over (and get stuck on) the same DOM node.
  const t = (key: string) => {
    const row = K[key];
    if (!row) return key;
    if (key.startsWith("nav.")) return (row[lang] ?? row.en) ?? key;
    return row.en ?? key;
  };
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
