const express = require('express');
const router = express.Router();

// Kampanya listesi
router.get('/', (req, res) => {
  // Kampanya verilerini döndür (DB'den al)
  res.json([
    { id: 1, name: "Teknoloji Gündemi", status: "gönderildi", sentAt: "2025-07-27" },
    { id: 2, name: "Ekonomi Bülteni", status: "taslak", sentAt: null }
  ]);
});

// Yeni kampanya oluştur
router.post('/', (req, res) => {
  // req.body ile kampanya verilerini al ve DB'ye kaydet
  res.status(201).json({ message: "Kampanya oluşturuldu." });
});

module.exports = router;