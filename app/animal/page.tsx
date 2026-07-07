"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import AnimalCore from "../../components/AnimalCore";
import AnimalInteractive from "../../components/AnimalInteractive";

function AnimalView() {
  const reg = useSearchParams().get("reg") || "";
  const [a, setA] = useState<any>(null);

  useEffect(() => {
    if (!reg) { setA(false as any); return; }
    api.animal(reg).then(setA).catch(() => setA(false as any));
  }, [reg]);

  if (a === false) return <div className="container section">Animal not found.</div>;
  if (!a) return <div className="container section">Loading…</div>;

  return (
    <div className="container section">
      <AnimalCore a={a} />
      <AnimalInteractive reg={a.registration_no || reg} name={a.name} />
    </div>
  );
}

export default function AnimalPage() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><AnimalView /></Suspense>;
}
