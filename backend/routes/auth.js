const express = require('express');
const router = express.Router();

// Giriş
router.post('/login', (req, res) => {
  // JWT döndür
  res.json({ token: "jwt-token-example" });
});

// Şifre sıfırlama talebi
router.post('/reset-password', (req, res) => {
  // E-posta gönder, token oluştur
  res.json({ message: "Şifre sıfırlama e-postası gönderildi." });
});

module.exports = router;