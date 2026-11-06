"""TÜİK Nüfus İstatistikleri Portalı → iller arası göç matrisi (2008–2025).

Ham sayfalar ham/goc-*.json; çıktı veri/goc.json:
  yillar, iller [[kod, ad]], nufus {yil: [81]}, akim {yil: [81*81]}  (akim[v*81+a] = v'den a'ya göç eden)
"""
import json, time, urllib.parse, urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
HAM = KOK / "ham"; HAM.mkdir(exist_ok=True)
(KOK / "veri").mkdir(exist_ok=True)
UA = "goc-haritasi (github.com/birtohum/goc-haritasi)"
SAYFA = 5000


def param(start):
    p = {"alanIl": "Hepsi", "verenIl": "Hepsi", "draw": "1", "start": str(start), "length": str(SAYFA), "search[value]": "", "search[regex]": "false"}
    for i in range(5):
        for k, v in {"data": str(i), "name": "", "searchable": "true", "orderable": "true", "search][value": "", "search][regex": "false"}.items():
            p[f"columns[{i}][{k}]"] = v
    return p


satir = []
start = 0
while True:
    f = HAM / f"goc-{start:06d}.json"
    if f.exists():
        d = json.loads(f.read_text(encoding="utf-8"))
    else:
        req = urllib.request.Request("https://nip.tuik.gov.tr/Home/IlYilIcGocIllerArasiForTable?", data=urllib.parse.urlencode(param(start)).encode(),
                                     headers={"User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=120) as r:
            d = json.loads(r.read().decode("utf-8"))
        f.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
        time.sleep(2)
    satir += d["data"]
    print(start, len(d["data"]), d["recordsTotal"], flush=True)
    start += SAYFA
    if start >= d["recordsTotal"] or not d["data"]:
        break

iller = sorted({(r["AlanIlKodu"], r["AlanIlAdi"]) for r in satir} | {(r["VerenIlKodu"], r["VerenIlAdi"]) for r in satir})
assert len(iller) == 81, len(iller)
yillar = sorted({r["Yil"] for r in satir})
akim = {y: [0] * 81 * 81 for y in yillar}
nufus = {y: [0] * 81 for y in yillar}
gorulen = set()
for r in satir:
    y, a, v = r["Yil"], r["AlanIlKodu"] - 1, r["VerenIlKodu"] - 1
    akim[y][v * 81 + a] = r["AldigiGoc"]  # v'den a'ya
    akim[y][a * 81 + v] = r["VerdigiGoc"]  # a'dan v'ye
    nufus[y][a] = r["AlanIlNufus"]; nufus[y][v] = r["VerenIlNufus"]
    gorulen.add((y, a, v))
print("yıl", yillar[0], "–", yillar[-1], "satır", len(satir), "çift", len(gorulen))
json.dump({"yillar": yillar, "iller": iller, "nufus": {str(y): nufus[y] for y in yillar}, "akim": {str(y): akim[y] for y in yillar}},
          open(KOK / "veri/goc.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
