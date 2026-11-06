"use strict";
const $ = (id) => document.getElementById(id);
const sayi = (x, b = 0) => x.toLocaleString("tr-TR", { minimumFractionDigits: b, maximumFractionDigits: b }).replace("-", "−");
const NS = "http://www.w3.org/2000/svg";

// Türkçe ekler: ek("Sivas","dan") → Sivas'tan, ek("İstanbul","a") → İstanbul'a, ek("Rize","a") → Rize'ye
function ek(s, e) {
  const k = s.toLocaleLowerCase("tr");
  const sesli = [...k].reverse().find((h) => "aıoueiöü".includes(h)) || "e";
  const kalin = "aıou".includes(sesli), son = k.slice(-1), sesliBiter = "aıoueiöü".includes(son);
  if (e === "a") return `${s}'${sesliBiter ? "y" : ""}${kalin ? "a" : "e"}`;
  let x = e.replace("a", kalin ? "a" : "e");
  if ("fstkçşhp".includes(son)) x = x.replace("d", "t");
  return `${s}'${x}`;
}

let G, H, il = 34, yon = "giden", donem = "hepsi";

function yillar() { return donem === "hepsi" ? G.yillar : [Number(donem)]; }
function topla(i) {
  const giden = new Float64Array(81), gelen = new Float64Array(81);
  let nufus = 0;
  for (const y of yillar()) {
    const a = G.akim[y];
    for (let j = 0; j < 81; j++) { giden[j] += a[i * 81 + j]; gelen[j] += a[j * 81 + i]; }
    nufus += G.nufus[y][i];
  }
  nufus /= yillar().length;
  const tg = giden.reduce((p, q) => p + q, 0), ta = gelen.reduce((p, q) => p + q, 0);
  return { giden, gelen, tg, ta, net: ta - tg, nufus };
}
const ad = (i) => H.iller[i].ad;

function ozet(o) {
  const enG = [...o.giden.keys()].sort((a, b) => o.giden[b] - o.giden[a])[0];
  const enA = [...o.gelen.keys()].sort((a, b) => o.gelen[b] - o.gelen[a])[0];
  const d = donem === "hepsi" ? `${G.yillar[0]}–${G.yillar[G.yillar.length - 1]} arasında` : `${donem} yılında`;
  const net = o.net < 0
    ? `net <b class="g">${sayi(-o.net)} kişi kaybetti</b>`
    : `net <b class="a">${sayi(o.net)} kişi kazandı</b>`;
  const oran = (1000 * o.net) / o.nufus / yillar().length;
  $("ozet").innerHTML = `<p class="cumle">${d} ${ek(ad(il), "dan")} <b>${sayi(o.tg)}</b> kişi başka bir ile taşındı, <b>${sayi(o.ta)}</b> kişi geldi: ${net}. Gidenlerin en çok gittiği yer ${ad(enG)} (%${sayi((100 * o.giden[enG]) / o.tg)}), gelenlerin en çok geldiği yer ${ad(enA)}.</p>
  <div class="kutular"><div class="kutu"><b>${sayi(o.tg)}</b><span>giden</span></div><div class="kutu"><b>${sayi(o.ta)}</b><span>gelen</span></div>
  <div class="kutu"><b>${oran > 0 ? "+" : ""}${sayi(oran, Math.abs(oran) < 1 ? 2 : 1)}</b><span>yılda her 1.000 kişide net</span></div></div>`;
}

function harita(o) {
  const s = $("harita");
  s.setAttribute("viewBox", `0 0 ${H.w} ${H.h}`);
  if (!s.firstChild) {
    H.iller.forEach((p, i) => {
      const e = document.createElementNS(NS, "path");
      e.setAttribute("d", p.d); e.dataset.i = i;
      const t = document.createElementNS(NS, "title"); t.textContent = p.ad; e.appendChild(t);
      e.addEventListener("click", () => sec(i));
      s.appendChild(e);
    });
    const g = document.createElementNS(NS, "g"); g.id = "oklar"; s.appendChild(g);
  }
  const deg = yon === "giden" ? o.giden : o.gelen, top = yon === "giden" ? o.tg : o.ta;
  const enb = Math.max(...deg);
  const renk = getComputedStyle(document.documentElement).getPropertyValue(yon === "giden" ? "--giden" : "--gelen").trim();
  [...s.querySelectorAll("path[data-i]")].forEach((e) => {
    const i = Number(e.dataset.i);
    e.classList.toggle("secili", i === il);
    const f = deg[i] / enb;
    e.style.fill = i === il ? "" : f > 0 ? `color-mix(in oklab, ${renk} ${Math.round(8 + 92 * Math.sqrt(f))}%, var(--il))` : "";
    e.querySelector("title").textContent = i === il ? ad(i) : `${ad(i)}: ${sayi(deg[i])} kişi (%${sayi((100 * deg[i]) / top, 1)})`;
  });
  const g = $("oklar"); g.innerHTML = "";
  const sira = [...deg.keys()].filter((j) => j !== il).sort((a, b) => deg[b] - deg[a]).slice(0, 10);
  const m = H.iller[il];
  sira.forEach((j, k) => {
    const h = H.iller[j];
    const [x1, y1, x2, y2] = yon === "giden" ? [m.x, m.y, h.x, h.y] : [h.x, h.y, m.x, m.y];
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const cx = (x1 + x2) / 2 - (dy / L) * L * 0.18, cy = (y1 + y2) / 2 + (dx / L) * L * 0.18;
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
    p.setAttribute("class", "ok");
    p.setAttribute("stroke", "var(--yazi)");
    p.setAttribute("stroke-width", (1 + 7 * (deg[j] / deg[sira[0]])).toFixed(1));
    p.setAttribute("stroke-opacity", "0.6");
    g.appendChild(p);
    if (k < 5) {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", h.x); t.setAttribute("y", h.y - 6); t.setAttribute("text-anchor", "middle"); t.setAttribute("class", "etiket");
      t.textContent = h.ad; g.appendChild(t);
    }
  });
  const t = document.createElementNS(NS, "text");
  t.setAttribute("x", m.x); t.setAttribute("y", m.y + 16); t.setAttribute("text-anchor", "middle"); t.setAttribute("class", "etiket");
  t.textContent = m.ad; g.appendChild(t);
  $("lejant").textContent = yon === "giden"
    ? `Koyu renk: ${ek(ad(il), "dan")} gidenlerin daha çok seçtiği il. Oklar en çok gidilen 10 il.`
    : `Koyu renk: ${ad(il)} için daha çok göç veren il. Oklar en çok gelinen 10 il.`;
}

function liste(o) {
  const deg = yon === "giden" ? o.giden : o.gelen, top = yon === "giden" ? o.tg : o.ta;
  $("listeBaslik").textContent = yon === "giden" ? "En çok gidilen 10 il" : "En çok gelinen 10 il";
  const sira = [...deg.keys()].filter((j) => j !== il).sort((a, b) => deg[b] - deg[a]).slice(0, 10);
  const renk = yon === "giden" ? "var(--giden)" : "var(--gelen)";
  $("liste").innerHTML = sira.map((j) => `<li><button data-i="${j}">${ad(j)}</button><span class="cubuk" style="width:${(100 * deg[j]) / deg[sira[0]]}%;background:${renk}"></span><span class="deger">${sayi(deg[j])}</span></li>`).join("");
}

function yilGrafik() {
  const G0 = 520, Y = 190, ust = 10, alt = 22;
  const n = G.yillar.map((y) => {
    const a = G.akim[y]; let g = 0, t = 0;
    for (let j = 0; j < 81; j++) { g += a[il * 81 + j]; t += a[j * 81 + il]; }
    return t - g;
  });
  const enb = Math.max(...n.map(Math.abs)) || 1, w = G0 / n.length;
  const y0 = ust + (Y - ust - alt) / 2, k = (Y - ust - alt) / 2 / enb;
  let s = `<svg viewBox="0 0 ${G0} ${Y}" role="img" aria-label="Yıllara göre net göç"><line x1="0" x2="${G0}" y1="${y0}" y2="${y0}" stroke="var(--cizgi)"/>`;
  n.forEach((v, i) => {
    const h = Math.abs(v) * k, y = v >= 0 ? y0 - h : y0, sec = donem !== "hepsi" && Number(donem) === G.yillar[i];
    s += `<rect x="${i * w + 2}" y="${y}" width="${w - 4}" height="${Math.max(h, 0.5)}" rx="2" fill="${v >= 0 ? "var(--gelen)" : "var(--giden)"}" opacity="${donem === "hepsi" || sec ? 1 : 0.35}"><title>${G.yillar[i]}: ${v > 0 ? "+" : ""}${sayi(v)}</title></rect>`;
    if (i % 3 === 0 || i === n.length - 1) s += `<text x="${i * w + w / 2}" y="${Y - 6}" text-anchor="middle">${G.yillar[i]}</text>`;
  });
  $("yillar").innerHTML = s + "</svg>";
}

function siralama() {
  const r = H.iller.map((_, i) => { const o = topla(i); return { i, oran: (1000 * o.net) / o.nufus / yillar().length }; });
  r.sort((a, b) => a.oran - b.oran);
  const enb = Math.max(Math.abs(r[0].oran), Math.abs(r[r.length - 1].oran));
  const sat = (x, renk) => `<li><button data-i="${x.i}">${ad(x.i)}</button><span class="cubuk" style="width:${(100 * Math.abs(x.oran)) / enb}%;background:${renk}"></span><span class="deger">${x.oran > 0 ? "+" : ""}${sayi(x.oran, 1)}</span></li>`;
  $("verenler").innerHTML = r.slice(0, 10).map((x) => sat(x, "var(--giden)")).join("");
  $("alanlar").innerHTML = r.slice(-10).reverse().map((x) => sat(x, "var(--gelen)")).join("");
  $("siraAlt").textContent = `${donem === "hepsi" ? `${G.yillar[0]}–${G.yillar[G.yillar.length - 1]} ortalaması` : donem}: yılda her 1.000 kişiye düşen net göç. Solda en çok veren, sağda en çok alan 10 il.`;
}

function ciz() {
  const o = topla(il);
  ozet(o); harita(o); liste(o); yilGrafik(); siralama();
  $("il").value = il;
  history.replaceState(null, "", `?il=${il + 1}${donem !== "hepsi" ? "&yil=" + donem : ""}`);
}
function sec(i) { il = i; ciz(); }

async function baslat() {
  [G, H] = await Promise.all([fetch("veri/goc.json").then((r) => r.json()), fetch("veri/harita.json").then((r) => r.json())]);
  const p = new URLSearchParams(location.search);
  const pi = Number(p.get("il")); if (pi >= 1 && pi <= 81) il = pi - 1; else il = 3; // varsayılan: dönemin en çok göç veren ili (Ağrı)
  if (G.yillar.includes(Number(p.get("yil")))) donem = p.get("yil");
  [...H.iller.keys()].sort((a, b) => ad(a).localeCompare(ad(b), "tr")).forEach((i) => $("il").add(new Option(ad(i), i)));
  $("donem").add(new Option(`Hepsi (${G.yillar[0]}–${G.yillar[G.yillar.length - 1]})`, "hepsi"));
  [...G.yillar].reverse().forEach((y) => $("donem").add(new Option(String(y), y)));
  $("donem").value = donem;
  $("il").onchange = (e) => sec(Number(e.target.value));
  $("donem").onchange = (e) => { donem = e.target.value; ciz(); };
  const sekme = (y) => { yon = y; $("sGiden").classList.toggle("secili", y === "giden"); $("sGelen").classList.toggle("secili", y === "gelen"); $("sGiden").setAttribute("aria-selected", y === "giden"); $("sGelen").setAttribute("aria-selected", y === "gelen"); ciz(); };
  $("sGiden").onclick = () => sekme("giden"); $("sGelen").onclick = () => sekme("gelen");
  document.body.addEventListener("click", (e) => { const b = e.target.closest(".liste button"); if (b) { sec(Number(b.dataset.i)); $("ozet").scrollIntoView({ behavior: "smooth" }); } });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ciz);
  ciz();
}
baslat();
