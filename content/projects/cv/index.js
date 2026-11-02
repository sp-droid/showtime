// One-page, ATS-friendly CV generator: JSON in, text-based PDF out.
const { jsPDF } = window.jspdf;

const PAGE = { w: 210, h: 297, margin: 14 };
const ACCENT = [20, 50, 110];
const PT = 0.3528; // mm per point

let pdfBlobUrl = null;
let fileName = "CV.pdf";

// Accepts hand-edited JSON: trailing commas and missing commas between objects
function parseLenient(text) {
  try { return JSON.parse(text); } catch {}
  const fixed = text
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/}(\s*){/g, "},$1{")
    .replace(/](\s*)\[/g, "],$1[");
  return JSON.parse(fixed);
}

// Flags drawn as vectors (emoji can't be embedded in a text PDF). Stripes: [orientation, colours, weights]
const STRIPES = {
  es: ["h", [[170, 21, 27], [241, 191, 0], [170, 21, 27]], [1, 2, 1]],
  de: ["h", [[0, 0, 0], [221, 0, 0], [255, 206, 0]]],
  it: ["v", [[0, 146, 70], [255, 255, 255], [206, 43, 55]]],
  fr: ["v", [[0, 85, 164], [255, 255, 255], [239, 65, 53]]],
  nl: ["h", [[174, 28, 40], [255, 255, 255], [33, 70, 139]]],
  at: ["h", [[200, 16, 46], [255, 255, 255], [200, 16, 46]]],
  be: ["v", [[0, 0, 0], [253, 218, 36], [239, 51, 64]]],
  ie: ["v", [[22, 155, 98], [255, 255, 255], [255, 136, 62]]],
  ru: ["h", [[255, 255, 255], [0, 57, 166], [213, 43, 30]]],
  pl: ["h", [[255, 255, 255], [220, 20, 60]]],
};

function drawFlag(doc, code, x, y, w, h) {
  code = String(code).toLowerCase();
  if (code === "gb" || code === "uk" || code === "en") {
    const blue = [1, 33, 105], red = [200, 16, 46];
    doc.saveGraphicsState();
    doc.rect(x, y, w, h, null); doc.clip(); doc.discardPath();
    doc.setFillColor(...blue); doc.rect(x, y, w, h, "F");
    const line = (c, lw, ax, ay, bx, by) => { doc.setDrawColor(...c); doc.setLineWidth(lw); doc.line(ax, ay, bx, by); };
    line([255, 255, 255], h * 0.2, x, y, x + w, y + h); line([255, 255, 255], h * 0.2, x, y + h, x + w, y);
    line(red, h * 0.07, x, y, x + w, y + h); line(red, h * 0.07, x, y + h, x + w, y);
    doc.setFillColor(255, 255, 255);
    doc.rect(x + w / 2 - h * 0.17, y, h * 0.34, h, "F"); doc.rect(x, y + h * 0.33, w, h * 0.34, "F");
    doc.setFillColor(...red);
    doc.rect(x + w / 2 - h * 0.1, y, h * 0.2, h, "F"); doc.rect(x, y + h * 0.4, w, h * 0.2, "F");
    doc.restoreGraphicsState();
  } else if (STRIPES[code]) {
    const [dir, colours, weights = colours.map(() => 1)] = STRIPES[code];
    const total = weights.reduce((a, b) => a + b, 0);
    let off = 0;
    colours.forEach((c, i) => {
      const f = weights[i] / total;
      doc.setFillColor(...c);
      if (dir === "h") doc.rect(x, y + off * h, w, f * h + 0.01, "F");
      else doc.rect(x + off * w, y, f * w + 0.01, h, "F");
      off += f;
    });
  } else return;
  doc.setDrawColor(190, 190, 190); doc.setLineWidth(0.1); doc.rect(x, y, w, h, "S");
}

function joinKeywords(k) { return Array.isArray(k) ? k.join(", ") : String(k ?? ""); }

// Normalise each section's entries to { title, sub, date, place, bullets, line, url }
const normalisers = {
  work: e => ({ title: e.position, sub: e.company, date: e.date, place: e.location, bullets: e.highlights }),
  education: e => ({ title: e.studyType, sub: e.institution, date: e.date, place: e.location, bullets: e.area ? [e.area] : e.highlights }),
  skills: e => ({ label: e.name, line: joinKeywords(e.keywords), flags: e.flags }),
  // "Awarder - Award": awarder in bold
  awards: e => {
    const [lead, ...rest] = String(e.title).split(" - ");
    return rest.length ? { lead, line: " - " + rest.join(" - "), date: e.date } : { line: e.title, date: e.date };
  },
  projects: e => ({ lead: e.title, line: e.description ? ": " + e.description : "", date: e.date, url: e.url, bullet: true, bullets: e.highlights }),
  courses: e => ({ line: e.title, date: e.date, url: e.url, bullet: true }),
};
const generic = e => ({ line: e.title ?? e.name ?? "", date: e.date, url: e.url, bullets: e.highlights });

function buildPdf(cv, scale) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const x0 = PAGE.margin, x1 = PAGE.w - PAGE.margin, width = x1 - x0;
  const fs = n => n * scale;
  const lh = n => n * scale * PT * 1.25;
  let y = PAGE.margin;

  const font = (style, size, color = [0, 0, 0]) => {
    doc.setFont("helvetica", style); doc.setFontSize(fs(size)); doc.setTextColor(...color);
  };
  const wrapped = (text, x, maxW, size) => {
    const lines = doc.splitTextToSize(String(text), maxW);
    lines.forEach(l => { y += lh(size); doc.text(l, x, y); });
  };

  // Header
  const p = cv["personal information"] || cv.personal || cv.basics || {};
  font("bold", 22, ACCENT);
  y += lh(22) * 0.8;
  doc.text(p.name || "", PAGE.w / 2, y, { align: "center" });
  if (p.title || p.headline) {
    font("normal", 11, [60, 60, 60]);
    y += lh(11) * 1.45; // same visual gap as headline → contact → first section
    doc.text(p.title || p.headline, PAGE.w / 2, y, { align: "center" });
  }
  // Contact items, each clickable where it makes sense
  const site = p.portfolio || p.url;
  const contact = [
    { text: p.from || p.location },
    { text: p.phone, url: p.phone && "tel:" + p.phone.replace(/\s+/g, "") },
    { text: p.email, url: p.email && "mailto:" + p.email },
    { text: site && site.replace(/^https?:\/\//, ""), url: site },
  ].filter(c => c.text);
  font("normal", 9.5, [40, 40, 40]);
  y += lh(9.5) * 1.6;
  const sep = "  |  ";
  const sepW = doc.getTextWidth(sep);
  const totalW = contact.reduce((s, c) => s + doc.getTextWidth(c.text), 0) + sepW * (contact.length - 1);
  let cx = (PAGE.w - totalW) / 2;
  contact.forEach((c, i) => {
    if (i) { doc.text(sep, cx, y); cx += sepW; }
    const w = doc.getTextWidth(c.text);
    doc.text(c.text, cx, y);
    if (c.url) doc.link(cx, y - lh(9.5) * 0.8, w, lh(9.5), { url: c.url });
    cx += w;
  });

  // Sections in the order given by cv.sections
  const sections = cv.sections || {};
  let firstSection = true;
  for (const [key, heading] of Object.entries(sections)) {
    const entries = cv[key];
    if (!Array.isArray(entries) || !entries.length) continue;

    y += lh(11) * (firstSection ? 0.4 : 0.9);
    firstSection = false;
    font("bold", 11, ACCENT);
    y += lh(11);
    doc.text(String(heading).toUpperCase(), x0, y);
    doc.setDrawColor(...ACCENT); doc.setLineWidth(0.35);
    doc.line(x0, y + 1.2 * scale, x1, y + 1.2 * scale);
    y += 1.2 * scale;

    const norm = normalisers[key] || generic;
    for (const raw of entries) {
      const e = norm(raw);
      const dateW = e.date ? (font("normal", 9.5), doc.getTextWidth(String(e.date)) + 3) : 0;

      if (e.title) {
        // Two-line entry: "Title, Org" + date on the right, then location in italics
        y += lh(10) * 0.35;
        font("bold", 10);
        const headLines = doc.splitTextToSize(e.sub ? `${e.title}, ${e.sub}` : e.title, width - dateW);
        y += lh(10);
        headLines.forEach((l, i) => { if (i) y += lh(10); doc.text(l, x0, y); });
        if (e.date) { font("normal", 9.5); doc.text(String(e.date), x1, y - lh(10) * (headLines.length - 1), { align: "right" }); }
        if (e.place) { font("italic", 9, [80, 80, 80]); wrapped(e.place, x0, width, 9); }
      } else if (e.label) {
        font("bold", 9.5);
        const label = `${e.label}: `;
        const lw = doc.getTextWidth(label);
        y += lh(9.5) * 1.05;
        doc.text(label, x0, y);
        // Optional flags, right-aligned on the first line
        const flags = Array.isArray(e.flags) ? e.flags : [];
        const fh = lh(9.5) * 0.62, fw = fh * 1.5, gap = fh * 0.45;
        const flagsW = flags.length ? flags.length * (fw + gap) : 0;
        flags.forEach((c, i) => drawFlag(doc, c, x1 - flagsW + gap + i * (fw + gap), y - fh * 0.95, fw, fh));
        font("normal", 9.5);
        const lines = doc.splitTextToSize(e.line, width - lw - flagsW);
        lines.forEach((l, i) => { if (i) y += lh(9.5); doc.text(l, x0 + lw, y); });
      } else {
        // Bold lead (linked if url) followed by normal text; whole lines are drawn to keep spaces intact
        const indent = e.bullet ? 4 * scale : 0;
        const maxW = width - dateW - indent;
        const x = x0 + indent;
        y += lh(9.5) * 1.05;
        const firstY = y;
        if (e.bullet) { font("normal", 9.5); doc.text("•", x0 + 1 * scale, y); }
        let leadW = 0;
        if (e.lead) {
          font("bold", 9.5, e.url ? ACCENT : [0, 0, 0]);
          leadW = doc.getTextWidth(e.lead);
          doc.text(e.lead, x, y);
          if (e.url) doc.link(x, y - lh(9.5) * 0.8, leadW, lh(9.5), { url: e.url });
        }
        font("normal", 9.5);
        let rest = e.line || "";
        // First line shares space with the lead; the remainder wraps at full width
        const spaceW = rest.startsWith(" ") ? doc.getTextWidth(" ") : 0;
        const first = doc.splitTextToSize(rest.trimStart(), maxW - leadW - spaceW)[0] || "";
        if (first) doc.text(first, x + leadW + spaceW, y);
        rest = rest.trimStart().slice(first.length).trim();
        if (rest) doc.splitTextToSize(rest, maxW).forEach(l => { y += lh(9.5); doc.text(l, x, y); });
        if (e.date) doc.text(String(e.date), x1, firstY, { align: "right" });
      }

      for (const b of (e.bullets || []).filter(Boolean)) {
        font("normal", 9.5, [25, 25, 25]);
        const indent = 4 * scale;
        const lines = doc.splitTextToSize(String(b), width - indent);
        lines.forEach((l, i) => {
          y += lh(9.5);
          if (!i) doc.text("•", x0 + 1 * scale, y);
          doc.text(l, x0 + indent, y);
        });
      }
    }
  }

  doc.setProperties({ title: `CV ${p.name || ""}`.trim(), author: p.name || "", subject: "Curriculum Vitae" });
  return { doc, bottom: y };
}

// Largest scale (capped at 1.12) whose output fits on a single page
function renderOnePage(cv) {
  let best = null;
  for (let s = 1.12; s >= 0.6; s -= 0.02) {
    const r = buildPdf(cv, s);
    best = r;
    if (r.bottom <= PAGE.h - PAGE.margin) return { ...r, scale: s, fits: true };
  }
  return { ...best, scale: 0.6, fits: false };
}

const $ = id => document.getElementById(id);
function setStatus(msg, err = false) { $("status").textContent = msg; $("status").className = err ? "err" : ""; }

function load(text) {
  let cv;
  try { cv = parseLenient(text); }
  catch (e) { setStatus("Invalid JSON: " + e.message, true); return; }
  try {
    const { doc, scale, fits } = renderOnePage(cv);
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    pdfBlobUrl = URL.createObjectURL(doc.output("blob"));
    const name = (cv["personal information"]?.name || "CV").replace(/\s+/g, "_");
    fileName = `CV_${name}.pdf`;
    $("preview").src = pdfBlobUrl;
    $("preview").style.display = "block";
    $("drop").style.display = "none";
    $("download").disabled = false;
    setStatus(fits ? `One page, text scale ${Math.round(scale * 100)}%.` : "Content too long for one page even at minimum size; trim the JSON.", !fits);
  } catch (e) { setStatus("Render error: " + e.message, true); console.error(e); }
}

$("file").addEventListener("change", async ev => { const f = ev.target.files[0]; if (f) load(await f.text()); });
$("example").addEventListener("click", async () => {
  try { load(await (await fetch("cv.json")).text()); }
  catch { setStatus("Could not fetch cv.json (open via a web server).", true); }
});
$("download").addEventListener("click", () => {
  const a = document.createElement("a"); a.href = pdfBlobUrl; a.download = fileName; a.click();
});
document.addEventListener("dragover", e => { e.preventDefault(); $("drop").classList.add("over"); });
document.addEventListener("dragleave", () => $("drop").classList.remove("over"));
document.addEventListener("drop", async e => {
  e.preventDefault(); $("drop").classList.remove("over");
  const f = e.dataTransfer.files[0]; if (f) load(await f.text());
});
