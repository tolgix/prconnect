# PRConnect - PR Bülten Yönetim Sistemi

PRConnect, ajanslar ve şirketler için geliştirilmiş modern bir PR (Halkla İlişkiler) bülten yönetim sistemidir. Basın bültenleri oluşturma, gazeteci kontakları yönetme, kampanya performansını takip etme ve analitik raporlama gibi kapsamlı özellikler sunar.

## 🚀 Özellikler

### 📊 Dashboard ve Analitikler
- Kampanya performansı özeti
- E-posta açılma ve tıklama oranları
- Gerçek zamanlı istatistikler
- Grafik ve görselleştirmeler

### 👥 Kullanıcı Yönetimi
- Rol tabanlı erişim kontrolü (Süper Admin, Yönetici, Veri Giriş, Görüntüleyici)
- Güvenli kimlik doğrulama (JWT)
- Kullanıcı profil yönetimi
- Şifre sıfırlama sistemi

### 📧 Kampanya Yönetimi
- WYSIWYG bülten editörü
- E-posta şablonları
- Kampanya zamanlama
- Test gönderimi
- Toplu e-posta gönderimi
- Performans takibi

### 📱 İletişim Listeleri
- Gazeteci ve medya kontakları
- Segment oluşturma
- CSV import/export
- Kontak kategorilendirme
- Otomatik temizlik

### 📰 Basın Verileri
- Gazeteci profilleri
- Medya kanalları
- Beat kategorileri (ekonomi, teknoloji, vs.)
- Sosyal medya linkleri
- İletişim geçmişi

### 🚫 Kara Liste Yönetimi
- Abonelik iptali yönetimi
- Spam şikayeti takibi
- Otomatik filtreleme
- Bounce yönetimi

### 📈 Analitik ve Raporlama
- Kampanya performans raporları
- Açılma/tıklama oranları
- Zaman bazlı analizler
- Export özellikleri

## 🛠 Teknoloji Yığını

### Frontend
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - UI bileşen kütüphanesi
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP istekleri
- **React Query** - Veri yönetimi
- **Recharts** - Grafik kütüphanesi
- **React Quill** - WYSIWYG editör

### Backend
- **Node.js & Express.js** - Web framework
- **MongoDB & Mongoose** - Veritabanı
- **JWT** - Authentication
- **SendGrid** - E-posta servisi
- **Multer** - Dosya yükleme
- **Bcrypt** - Şifre hashleme
- **Express Validator** - Veri validasyonu

## 📋 Kurulum

### Ön Gereksinimler
- Node.js (v16 veya üzeri)
- MongoDB (v4.4 veya üzeri)
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone [repository-url]
cd prconnect
```

### 2. Backend Kurulumu
```bash
cd backend
npm install

# Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin (veritabanı, e-posta servisi vs.)

# MongoDB'yi başlatın
mongod

# Backend sunucusunu başlatın
npm run dev
```

### 3. Frontend Kurulumu
```bash
# Ana dizinde
npm install

# Frontend'i başlatın
npm start
```

### 4. Ortam Değişkenleri (.env)
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/prconnect

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=Your Company Name

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🚀 Kullanım

### İlk Giriş
1. Tarayıcınızda `http://localhost:3000` adresine gidin
2. Demo hesap bilgileri:
   - **E-posta:** admin@prconnect.com
   - **Şifre:** admin123

### Temel İşlemler

#### 1. Kullanıcı Oluşturma (Sadece Admin)
- Kullanıcı Yönetimi bölümüne gidin
- "Yeni Kullanıcı" butonuna tıklayın
- Bilgileri doldurup rolü seçin

#### 2. Kampanya Oluşturma
- Kampanyalar bölümüne gidin
- "Yeni Kampanya" butonuna tıklayın
- Bülten içeriğini WYSIWYG editör ile oluşturun
- Hedef listeleri seçin
- Test gönderin ve sonra kampanyayı başlatın

#### 3. Kontak İmport Etme
- İletişim Listeleri bölümüne gidin
- "İmport" butonuna tıklayın
- CSV dosyasını yükleyin

#### 4. Analitikleri İnceleme
- Dashboard'da genel performansı görün
- Analitikler bölümünde detaylı raporları inceleyin

## 📁 Proje Yapısı

```
prconnect/
├── backend/                 # Backend API
│   ├── models/             # MongoDB modelleri
│   ├── routes/             # API route'ları
│   ├── middleware/         # Custom middleware'ler
│   ├── utils/              # Yardımcı fonksiyonlar
│   └── server.js           # Ana server dosyası
├── src/                    # Frontend
│   ├── components/         # React bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   ├── contexts/           # React Context'leri
│   └── App.js              # Ana uygulama
├── public/                 # Statik dosyalar
└── package.json            # Proje bağımlılıkları
```

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Rol tabanlı erişim kontrolü
- Rate limiting
- Input validasyonu
- CORS koruması
- Helmet.js güvenlik başlıkları

## 🔧 API Dokümantasyonu

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Kullanıcı profili
- `POST /api/auth/forgot-password` - Şifre sıfırlama

### Users
- `GET /api/users` - Kullanıcı listesi
- `POST /api/users` - Yeni kullanıcı
- `PUT /api/users/:id` - Kullanıcı güncelle
- `DELETE /api/users/:id` - Kullanıcı sil

### Campaigns
- `GET /api/campaigns` - Kampanya listesi
- `POST /api/campaigns` - Yeni kampanya
- `PUT /api/campaigns/:id` - Kampanya güncelle
- `POST /api/campaigns/:id/send` - Kampanya gönder

### Contacts
- `GET /api/contacts` - Kontak listesi
- `POST /api/contacts` - Yeni kontak
- `GET /api/contacts/lists` - İletişim listeleri

### Press
- `GET /api/press` - Basın kontakları
- `POST /api/press` - Yeni basın kontağı
- `PUT /api/press/:id` - Basın kontağı güncelle

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## 📞 Destek

Herhangi bir sorun yaşadığınızda:
1. GitHub Issues bölümünde arayın
2. Yeni issue oluşturun
3. Detaylı açıklama ve hata logları ekleyin

## 🗺 Roadmap

### v1.1 (Yakında)
- [ ] Gelişmiş bülten editörü
- [ ] E-posta şablonları
- [ ] Sosyal medya entegrasyonu
- [ ] API rate limiting iyileştirmeleri

### v1.2 (Planlanan)
- [ ] Multi-tenant desteği
- [ ] Gelişmiş analitikler
- [ ] Webhook entegrasyonları
- [ ] Mobile responsive iyileştirmeler

### v2.0 (Gelecek)
- [ ] AI destekli içerik önerileri
- [ ] Otomatik segment oluşturma
- [ ] Gelişmiş raporlama
- [ ] CRM entegrasyonları

---

**PRConnect** ile PR kampanyalarınızı profesyonel bir şekilde yönetin! 🚀