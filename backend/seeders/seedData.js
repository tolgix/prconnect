const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const ContactList = require('../models/ContactList');
const PressContact = require('../models/PressContact');
const Blacklist = require('../models/Blacklist');

const seedData = async () => {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prconnect');
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut verileri temizle
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Contact.deleteMany({});
    await ContactList.deleteMany({});
    await PressContact.deleteMany({});
    await Blacklist.deleteMany({});

    console.log('Mevcut veriler temizlendi');

    // Admin kullanıcı oluştur
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@prconnect.com',
      password: 'admin123',
      role: 'superadmin',
      isActive: true,
      lastLogin: new Date()
    });

    // Diğer kullanıcıları oluştur
    const managerUser = await User.create({
      name: 'Mehmet Özkan',
      email: 'mehmet@prconnect.com',
      password: 'mehmet123',
      role: 'manager',
      isActive: true,
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 gün önce
    });

    const dataEntryUser = await User.create({
      name: 'Ayşe Demir',
      email: 'ayse@prconnect.com',
      password: 'ayse123',
      role: 'dataentry',
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 saat önce
    });

    const viewerUser = await User.create({
      name: 'Can Yılmaz',
      email: 'can@prconnect.com',
      password: 'can123',
      role: 'viewer',
      isActive: false,
      lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 gün önce
    });

    console.log('Kullanıcılar oluşturuldu');

    // İletişim listeleri oluştur
    const techList = await ContactList.create({
      name: 'Teknoloji Gazetecileri',
      description: 'Teknoloji alanında uzman gazeteciler',
      createdBy: adminUser._id,
      contactCount: 0
    });

    const economyList = await ContactList.create({
      name: 'Ekonomi Muhabirleri',
      description: 'Ekonomi ve finans muhabirleri',
      createdBy: managerUser._id,
      contactCount: 0
    });

    const generalList = await ContactList.create({
      name: 'Genel Basın Listesi',
      description: 'Tüm genel medya kontakları',
      createdBy: adminUser._id,
      contactCount: 0
    });

    console.log('İletişim listeleri oluşturuldu');

    // Basın kontakları oluştur
    const pressContacts = [
      {
        name: 'Zeynep Teknoloji',
        email: 'zeynep@teknohaber.com',
        jobTitle: 'Teknoloji Editörü',
        organization: 'TeknoHaber',
        phone: '+90 212 123 4567',
        website: 'https://teknohaber.com',
        mediaType: 'online',
        beat: 'teknoloji',
        region: 'istanbul',
        influence: 'yüksek',
        language: 'tr',
        socialLinks: {
          twitter: '@zeynepteknoloji',
          linkedin: 'zeynep-teknoloji'
        }
      },
      {
        name: 'Ahmet Ekonomi',
        email: 'ahmet@ekonomigazetesi.com',
        jobTitle: 'Ekonomi Muhabiri',
        organization: 'Ekonomi Gazetesi',
        phone: '+90 212 234 5678',
        mediaType: 'gazete',
        beat: 'ekonomi',
        region: 'istanbul',
        influence: 'yüksek',
        language: 'tr'
      },
      {
        name: 'Fatma Siyaset',
        email: 'fatma@haberanaliz.com',
        jobTitle: 'Siyaset Analisti',
        organization: 'Haber Analiz',
        phone: '+90 312 345 6789',
        mediaType: 'tv',
        beat: 'siyaset',
        region: 'ankara',
        influence: 'çok_yüksek',
        language: 'tr',
        socialLinks: {
          twitter: '@fatmasiyaset'
        }
      },
      {
        name: 'John Tech',
        email: 'john@techenglish.com',
        jobTitle: 'Senior Tech Editor',
        organization: 'Tech English',
        phone: '+90 212 456 7890',
        mediaType: 'online',
        beat: 'teknoloji',
        region: 'istanbul',
        influence: 'yüksek',
        language: 'en'
      },
      {
        name: 'Elif Spor',
        email: 'elif@sporgazetesi.com',
        jobTitle: 'Spor Muhabiri',
        organization: 'Spor Gazetesi',
        phone: '+90 212 567 8901',
        mediaType: 'gazete',
        beat: 'spor',
        region: 'istanbul',
        influence: 'orta',
        language: 'tr'
      }
    ];

    await PressContact.insertMany(pressContacts);
    console.log('Basın kontakları oluşturuldu');

    // Normal kontaklar oluştur
    const contacts = [
      {
        name: 'Murat Yazar',
        email: 'murat@medyagrubu.com',
        organization: 'Medya Grubu',
        position: 'İçerik Editörü',
        phone: '+90 212 678 9012',
        contactLists: [generalList._id],
        source: 'manual'
      },
      {
        name: 'Selin Editör',
        email: 'selin@dijitalajans.com',
        organization: 'Dijital Ajans',
        position: 'Kreatif Direktör',
        phone: '+90 216 789 0123',
        contactLists: [techList._id],
        source: 'manual'
      },
      {
        name: 'Burak Analiz',
        email: 'burak@analizportal.com',
        organization: 'Analiz Portal',
        position: 'Veri Analisti',
        contactLists: [economyList._id],
        source: 'import'
      }
    ];

    await Contact.insertMany(contacts);
    
    // İletişim listelerinin kontak sayılarını güncelle
    await ContactList.findByIdAndUpdate(generalList._id, { contactCount: 1 });
    await ContactList.findByIdAndUpdate(techList._id, { contactCount: 1 });
    await ContactList.findByIdAndUpdate(economyList._id, { contactCount: 1 });

    console.log('Kontaklar oluşturuldu');

    // Kampanyalar oluştur
    const campaigns = [
      {
        name: 'Yeni Ürün Lansmanı',
        subject: 'Devrim Niteliğinde Yeni Ürünümüz Tanıtıldı',
        senderName: 'PRConnect Team',
        senderEmail: 'noreply@prconnect.com',
        content: `
          <h2>Yeni Ürün Lansmanı</h2>
          <p>Değerli basın mensupları,</p>
          <p>Bugün itibariyle piyasaya sürdüğümüz yeni ürünümüzü sizlere duyurmaktan mutluluk duyuyoruz.</p>
          <p>Bu ürün, sektörde devrim yaratacak özellikler barındırmaktadır:</p>
          <ul>
            <li>Yenilikçi teknoloji</li>
            <li>Kullanıcı dostu arayüz</li>
            <li>Uygun fiyat</li>
          </ul>
          <p>Detaylı bilgi için bizimle iletişime geçebilirsiniz.</p>
          <p>Saygılarımızla,<br>PRConnect Team</p>
        `,
        status: 'sent',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
        createdBy: adminUser._id,
        targetLists: [techList._id, generalList._id],
        analytics: {
          totalSent: 1200,
          delivered: 1180,
          opened: 540,
          clicked: 156,
          bounced: 20,
          unsubscribed: 3,
          openRate: 45.8,
          clickRate: 13.2,
          bounceRate: 1.7
        }
      },
      {
        name: 'Basın Toplantısı Duyurusu',
        subject: 'Önemli Basın Toplantısı - 25 Ocak',
        senderName: 'PRConnect Team',
        senderEmail: 'noreply@prconnect.com',
        content: `
          <h2>Basın Toplantısı Duyurusu</h2>
          <p>Sayın basın mensupları,</p>
          <p>25 Ocak tarihinde düzenleyeceğimiz basın toplantısına davetlisiniz.</p>
          <p><strong>Tarih:</strong> 25 Ocak 2024</p>
          <p><strong>Saat:</strong> 14:00</p>
          <p><strong>Yer:</strong> İstanbul Kongre Merkezi</p>
          <p>Katılım için lütfen önceden kayıt yaptırınız.</p>
        `,
        status: 'draft',
        createdBy: managerUser._id,
        targetLists: [generalList._id]
      },
      {
        name: 'Şirket Etkinliği',
        subject: 'Yıllık Gala Etkinliğimize Davetlisiniz',
        senderName: 'PRConnect Team',
        senderEmail: 'noreply@prconnect.com',
        content: `
          <h2>Yıllık Gala Etkinliği</h2>
          <p>Değerli dostlarımız,</p>
          <p>Bu yıl da düzenlediğimiz geleneksel gala etkinliğimize sizleri davet ediyoruz.</p>
        `,
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 gün sonra
        createdBy: adminUser._id,
        targetLists: [generalList._id]
      },
      {
        name: 'Teknoloji Semineri',
        subject: 'Ücretsiz Teknoloji Semineri - Kayıtlar Başladı',
        senderName: 'PRConnect Team',
        senderEmail: 'noreply@prconnect.com',
        content: `
          <h2>Teknoloji Semineri</h2>
          <p>Teknoloji tutkunları,</p>
          <p>Ücretsiz teknoloji seminerimize katılmak için hemen kayıt olun!</p>
        `,
        status: 'sent',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 hafta önce
        createdBy: dataEntryUser._id,
        targetLists: [techList._id],
        analytics: {
          totalSent: 850,
          delivered: 835,
          opened: 320,
          clicked: 98,
          bounced: 15,
          unsubscribed: 2,
          openRate: 38.3,
          clickRate: 11.7,
          bounceRate: 1.8
        }
      }
    ];

    await Campaign.insertMany(campaigns);
    console.log('Kampanyalar oluşturuldu');

    // Kara liste girişleri oluştur
    const blacklistEntries = [
      {
        email: 'spam@example.com',
        reason: 'spam_complaint',
        description: 'Kullanıcı spam şikayetinde bulundu',
        addedBy: adminUser._id
      },
      {
        email: 'bounce@invalid.com',
        reason: 'bounce',
        description: 'E-posta adresi geçersiz',
        bounceType: 'hard',
        bounceCount: 3,
        addedBy: managerUser._id
      },
      {
        email: 'unsubscribe@test.com',
        reason: 'unsubscribe',
        description: 'Kullanıcı abonelik iptali yaptı',
        addedBy: adminUser._id
      }
    ];

    await Blacklist.insertMany(blacklistEntries);
    console.log('Kara liste girişleri oluşturuldu');

    console.log('\n🎉 Seed veriler başarıyla oluşturuldu!');
    console.log('\n📧 Demo hesaplar:');
    console.log('👑 Admin: admin@prconnect.com / admin123');
    console.log('👨‍💼 Manager: mehmet@prconnect.com / mehmet123');
    console.log('📝 Data Entry: ayse@prconnect.com / ayse123');
    console.log('👁️ Viewer: can@prconnect.com / can123');
    
    console.log('\n📊 Oluşturulan veriler:');
    console.log(`- ${await User.countDocuments()} kullanıcı`);
    console.log(`- ${await Campaign.countDocuments()} kampanya`);
    console.log(`- ${await Contact.countDocuments()} kontak`);
    console.log(`- ${await ContactList.countDocuments()} iletişim listesi`);
    console.log(`- ${await PressContact.countDocuments()} basın kontağı`);
    console.log(`- ${await Blacklist.countDocuments()} kara liste girişi`);

    process.exit(0);

  } catch (error) {
    console.error('Seed işlemi sırasında hata:', error);
    process.exit(1);
  }
};

// Script çalıştırıldığında seed'i başlat
if (require.main === module) {
  seedData();
}

module.exports = seedData;