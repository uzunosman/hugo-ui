# Hugo UI

Hugo, 51 puanlık bir Okey 101 varyasyonu için geliştirilen modern web arayüzü.

## Özellikler

### Oyun Tahtası
- Sabit boyutlu oyun alanı (720x720px)
- Turkuaz renkli arka plan (#0097b2)
- Merkezi konumlandırılmış oyun tahtası
- Hafif saydam siyah arka plan (0.1 opaklık)
- Yuvarlatılmış köşeler (8px)

### Oyuncu Panelleri
- 4 oyuncu için panel gösterimi
- Gri arka planlı paneller (#808080)
- Her oyuncu için:
  - Avatar gösterimi (24x24px yuvarlak)
  - İsim gösterimi
  - Skor gösterimi
- Konumlar:
  - Üst: 3. Oyuncu
  - Sağ: 2. Oyuncu (sabit pozisyon)
  - Alt: 1. Oyuncu
  - Sol: 4. Oyuncu

### Süre Göstergesi
- Her oyuncu için 60 saniyelik süre
- Yeşil renkli süre çubuğu (#4CAF50)
- 20 saniye altında kırmızıya dönüşüm (#FF5252)
- Yatay panellerde üstte, dikey panellerde yanda gösterim

### Taş Tutucusu
- Turuncu/sarı gradient arka plan
- İki sıra halinde taş dizilimi
- Her sırada 15 taş kapasitesi
- Sıralar arası ayırıcı çizgi
- Ekranın alt kısmında sabit konum

### Taşlar
- Boyut: 40x60px
- Renkler:
  - Kırmızı (#FF0000)
  - Siyah (#000000)
  - Mavi (#00BCD4)
  - Sarı (#FFC107)
- Alt kısımda renkli nokta göstergesi
- Kapalı taşlar için:
  - Gri daire içinde "48" gösterimi
  - Nokta göstergesi yok

### Sürükleme ve Bırakma Özellikleri
- Taşları sürükleyip bırakma desteği
- Sürükleme başladığında mouse taşın merkezinde konumlanır
- Taşa tıklandığında mouse otomatik olarak merkeze gelir
- Akıllı taş yerleştirme sistemi:
  - Hedef konumda taş varsa otomatik kaydırma
  - Tercih edilen yönde boşluk yoksa alternatif yöne kaydırma
  - Sağa/sola kaydırma için dinamik boşluk bulma
  - Taşların kaybolmasını önleyen güvenlik kontrolleri

### Orta Alan
- İki taş gösterimi
  - Sol: Kapalı taş
  - Sağ: Açık taş
- 51 puan göstergesi

## Teknik Detaylar

### CSS Yapısı
- Global stiller: `global.css`
  - CSS değişkenleri ile merkezi yönetim
  - Oyun boyutu (--game-size: 720px)
- Component-bazlı CSS dosyaları:
  - `GameBoard.css`
  - `PlayerPanel.css`
  - `TileHolder.css`
  - `CenterTile.css`
  - `CenterArea.css`

### Sabit Boyut
- Oyun alanı: 720x720px
- Responsive özellikler kaldırıldı
- CSS değişkenleri ile kolay boyut yönetimi
- Ekran boyutundan bağımsız sabit konumlandırmalar

### Component Yapısı
- `GameBoard`: Ana oyun komponenti
- `PlayerPanel`: Oyuncu bilgi paneli
- `TileHolder`: Taş tutucu
- `CenterTile`: Orta alan taşları
- `CenterArea`: Orta alan yönetimi

### Font
- Roboto font ailesi
- Boyutlar:
  - Oyuncu isimleri: 18px
  - Skorlar: 24px
  - Taş numaraları: 28px
