import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimalCore from "../../../components/AnimalCore";
import AnimalInteractive from "../../../components/AnimalInteractive";

export const dynamicParams = false; // only the pre-rendered foundation animals; others use /animal?reg=

const API = process.env.NEXT_PUBLIC_API_BASE || "https://api.wagyutank.com";

async function getAnimal(reg: string) {
  try {
    const r = await fetch(`${API}/api/animals/${encodeURIComponent(reg)}`);
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

export async function generateStaticParams() {
  try {
    const animals: any[] = await fetch(`${API}/api/animals/foundation`).then((r) => r.json());
    return animals
      .map((a) => a.slug || a.registration_no)
      .filter((s: string) => s && /^[A-Za-z0-9._-]+$/.test(s))
      .map((reg: string) => ({ reg }));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ reg: string }> }): Promise<Metadata> {
  const { reg } = await params;
  const a = await getAnimal(reg);
  if (!a) return { title: "Wagyu Foundation Animal" };
  const role = a.animal_type === "cow" ? "Dam" : "Sire";
  const desc = (a.bio ? String(a.bio).slice(0, 155)
    : `${a.name} — a ${a.breed || "Wagyu"} foundation ${role.toLowerCase()}. Pedigree, bloodline, genetics for sale, and history.`)
    .replace(/\s+/g, " ").trim();
  return {
    title: `${a.name}${a.registration_no ? ` (${a.registration_no})` : ""} — Wagyu Foundation ${role}`,
    description: desc,
    alternates: { canonical: `/animal/${reg}/` },
    openGraph: { title: `${a.name} · WagyuTank`, description: desc, url: `/animal/${reg}/`,
      images: a.photo_url ? [a.photo_url] : undefined },
  };
}

export default async function Page({ params }: { params: Promise<{ reg: string }> }) {
  const { reg } = await params;
  const a = await getAnimal(reg);
  if (!a) notFound();

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Foundation Bloodlines", item: "https://www.wagyutank.com/foundation/" },
      { "@type": "ListItem", position: 2, name: a.name, item: `https://www.wagyutank.com/animal/${reg}/` },
    ],
  };

  return (
    <div className="container section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <AnimalCore a={a} />
      <AnimalInteractive reg={a.registration_no || reg} name={a.name} />
    </div>
  );
}
