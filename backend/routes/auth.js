const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

// JWT token oluşturma fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı kontrol et
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Şifreyi kontrol et
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Hesap aktif mi kontrol et
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif edilmiştir. Lütfen yönetici ile iletişime geçiniz'
      });
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Token oluştur ve gönder
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcı profili getir
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şifre sıfırlama isteği
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // Reset token oluştur
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Reset URL'i oluştur
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `
      Şifre sıfırlama talebiniz alınmıştır. Aşağıdaki linke tıklayarak şifrenizi sıfırlayabilirsiniz:
      
      ${resetUrl}
      
      Bu link 10 dakika süreyle geçerlidir.
      
      Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'PRConnect - Şifre Sıfırlama',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Şifre sıfırlama linki e-posta adresinize gönderildi'
      });

    } catch (error) {
      console.error('E-posta gönderim hatası:', error);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'E-posta gönderilemedi'
      });
    }

  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şifre sıfırlama
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', [
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    // Token'ı hash'le ve kullanıcıyı bul
    const resetPasswordToken = require('crypto')
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Yeni şifreyi ayarla
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Token oluştur ve gönder
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla güncellendi',
      token
    });

  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şifre güncelleme
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, [
  body('currentPassword').notEmpty().withMessage('Mevcut şifre gereklidir'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Mevcut şifreyi kontrol et
    const isMatch = await user.matchPassword(req.body.currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla güncellendi',
      token
    });

  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;