const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token doğrulama
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bu rotaya erişim için giriş yapmanız gereklidir'
    });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı veritabanından al
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bu token ile ilişkili kullanıcı bulunamadı'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif edilmiştir'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};

// Rol tabanlı yetkilendirme
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `${req.user.role} rolü bu işlemi gerçekleştirme yetkisine sahip değil`
      });
    }
    next();
  };
};

// Admin rolü kontrolü
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem sadece süper admin tarafından gerçekleştirilebilir'
    });
  }
  next();
};

// Kendi verilerine erişim kontrolü
exports.ownerOrAdmin = (req, res, next) => {
  if (req.user.role === 'superadmin' || req.user._id.toString() === req.params.id) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bu verilere erişim yetkiniz bulunmamaktadır'
    });
  }
};