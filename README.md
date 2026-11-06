# Memleketten kim gitti?

**Canlı:** https://birtohum.github.io/goc-haritasi/

Bir il seç. Sayfa, 2008–2025 arasında o ilden kaç kişinin başka bir ile taşındığını, kaç kişinin geldiğini ve en çok hangi illere gidip hangi illerden gelindiğini gösterir. Bunlar haritada ve yıl yıl net göç grafiğinde görünür. En altta iller nüfuslarına göre sıralanır: yılda her 1.000 kişiye düşen net göç.

## Veri

- **Kaynak:** TÜİK Adrese Dayalı Nüfus Kayıt Sistemi, iller arası göç (Nüfus İstatistikleri Portalı).
- **Kapsam:** 2008–2025, 81 × 80 il çifti, toplam 116.640 satır. `araclar/topla.py` veriyi bir kez, 5.000 satırlık sayfalar hâlinde ve istekler arasında bekleyerek çekti.
- **Nasıl okunmalı:** Göç, kayıtlı yerleşim adresinin il değiştirmesidir. Adres değiştirmeden yaşanan taşınma, mevsimlik göç ve yurt dışına göç bu sayılarda yok.

## Gözlemler (2008–2025)

- **En çok veren:** Nüfusuna oranla en çok göç veren il Ağrı: yılda her 1.000 kişide −25,8. Onu Muş (−21,9) ve Kars (−20,8) izliyor.
- **En çok alan:** En çok göç alan il Tekirdağ (+17,8), sonra Yalova (+16,7) ve Muğla (+11,1).
- **İstanbul:** 7,28 milyon kişi verdi, 7,28 milyon kişi aldı; net yalnızca −7.631.
- **2023 depremleri:** Hatay'dan 164.247 kişi başka bir ile taşındı.

## Harita

İl sınırları geoBoundaries'ten (CC BY-SA 2.0, kaynağı OpenStreetMap) alındı ve Douglas–Peucker yöntemiyle sadeleştirildi. Oklar il merkezlerini birleştirir.

Kod Apache-2.0 lisanslıdır.
