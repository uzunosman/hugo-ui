# Hugo Oyunu - Frontend

Hugo, Türk okey oyununun modern bir versiyonudur. Bu repository, oyunun frontend kısmını içerir ve React + Vite kullanılarak geliştirilmiştir.

## Özellikler

- Modern ve responsive tasarım
- Real-time oyun deneyimi
- Sürükle-bırak taş hareketi
- Otomatik taş sıralama
- Oyuncu durumu gösterimi

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretime hazır build al
npm run build
```

## Geliştirme

Proje Vite ile oluşturulmuştur ve aşağıdaki teknolojileri kullanır:
- React 19
- SignalR 8.0
- Styled Components

## Notlar

- Backend ile iletişim için SignalR kullanılmaktadır
- Oyun 4 oyuncu ile oynanır
- Her oyuncuya başlangıçta 14-15 taş dağıtılır
