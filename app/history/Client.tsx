"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";

function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // inline: images, links, bold, italic (images/links get raw href/src, not escaped text)
  const inline = (s: string) => {
    let out = esc(s);
    out = out.replace(/!\[(.*?)\]\((.*?)\)/g, (_m, a, u) => `<img src="${u}" alt="${a}" loading="lazy"/>`);
    out = out.replace(/\[(.+?)\]\((.+?)\)/g, (_m, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    return out;
  };
  const lines = md.split("\n");
  let html = "", inList = false, i = 0;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
  const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    // audio player: !audio[Caption](/path.m4a)
    const au = line.match(/^!audio\[(.*?)\]\((.*?)\)\s*$/);
    // image gallery: !gallery url "cap" | url "cap" | ...
    const gal = line.match(/^!gallery\s+(.+)$/);
    // standalone image: ![alt](src)  on its own line -> figure
    const img = line.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
    if (au) { closeList();
      html += `<figure class="bh-audio"><audio controls preload="none" src="${au[2]}"></audio>` +
              (au[1] ? `<figcaption>${inline(au[1])}</figcaption>` : "") + `</figure>`; i++; continue; }
    if (gal) { closeList();
      const items = gal[1].split("|").map((it) => {
        const m = it.trim().match(/^(\S+)(?:\s+"(.*?)")?$/);
        return m ? `<figure><img src="${m[1]}" alt="${m[2] || ""}" loading="lazy"/>` +
                   (m[2] ? `<figcaption>${inline(m[2])}</figcaption>` : "") + `</figure>` : "";
      }).join("");
      html += `<div class="bh-gallery">${items}</div>`; i++; continue; }
    if (img) { closeList(); html += `<figure><img src="${img[2]}" alt="${img[1]}" loading="lazy"/>` +
      (img[1] ? `<figcaption>${inline(img[1])}</figcaption>` : "") + `</figure>`; i++; continue; }
    // table: header row + |---| separator + body rows
    if (isTableRow(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeList();
      const head = cells(line);
      let body = ""; i += 2;
      while (i < lines.length && isTableRow(lines[i])) {
        body += "<tr>" + cells(lines[i]).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>"; i++;
      }
      html += `<div class="bh-tablewrap"><table class="bh-table"><thead><tr>` +
        head.map((h) => `<th>${inline(h)}</th>`).join("") + `</tr></thead><tbody>${body}</tbody></table></div>`;
      continue;
    }
    if (/^### /.test(line)) { closeList(); html += `<h3>${inline(line.slice(4))}</h3>`; }
    else if (/^## /.test(line)) { closeList(); html += `<h2>${inline(line.slice(3))}</h2>`; }
    else if (/^# /.test(line)) { closeList(); html += `<h1>${inline(line.slice(2))}</h1>`; }
    else if (/^>\s?/.test(line)) { closeList(); html += `<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`; }
    else if (/^---\s*$/.test(line)) { closeList(); html += "<hr/>"; }
    else if (/^[-*] /.test(line)) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(line.slice(2))}</li>`; }
    else if (line === "") { closeList(); }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
    i++;
  }
  closeList();
  return html;
}

export default function History() {
  const { lang } = useLang();
  const [md, setMd] = useState<string | null>(null);
  useEffect(() => {
    setMd(null);
    api.breedHistory(lang).then((r) => setMd(r.markdown)).catch(() => setMd(""));
  }, [lang]);
  return (
    <div className="container section">
      <div className="prose">
        {md === null ? <p className="muted">Loading…</p> : (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
        )}
        <div className="adslot" style={{ textAlign: "left", marginTop: 30 }}>
          <strong className="gold">Meet the founders</strong>
          <p className="muted" style={{ marginTop: 6 }}>
            Browse every foundation bull and cow — full histories, bloodlines, and photos.
          </p>
          <Link href="/foundation" className="btn btn-gold" style={{ marginTop: 8 }}>View the foundation animals →</Link>
        </div>
      </div>
    </div>
  );
}
