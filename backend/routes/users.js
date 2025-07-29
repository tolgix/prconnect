const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, adminOnly, ownerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// @desc    Tüm kullanıcıları listele
// @route   GET /api/users
// @access  Private (Admin/Manager)
router.get('/', authorize('superadmin', 'manager'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Arama filtresi
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Rol filtresi
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Aktiflik filtresi
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Tek kullanıcı getir
// @route   GET /api/users/:id
// @access  Private (Owner/Admin)
router.get('/:id', ownerOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Yeni kullanıcı oluştur
// @route   POST /api/users
// @access  Private (Admin)
router.post('/', adminOnly, [
  body('name').notEmpty().trim().withMessage('İsim gereklidir'),
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('role').isIn(['superadmin', 'manager', 'dataentry', 'viewer']).withMessage('Geçerli bir rol seçiniz')
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

    const { name, email, password, role } = req.body;

    // E-posta benzersizliği kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı kullanıcı zaten mevcut'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcı güncelle
// @route   PUT /api/users/:id
// @access  Private (Owner/Admin)
router.put('/:id', ownerOrAdmin, [
  body('name').optional().trim().notEmpty().withMessage('İsim boş olamaz'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('role').optional().isIn(['superadmin', 'manager', 'dataentry', 'viewer']).withMessage('Geçerli bir rol seçiniz')
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

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kendi rolünü değiştirme kontrolü
    if (req.body.role && req.user._id.toString() === req.params.id && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Kendi rolünüzü değiştiremezsiniz'
      });
    }

    // E-posta benzersizliği kontrolü
    if (req.body.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor'
        });
      }
    }

    const fieldsToUpdate = ['name', 'email', 'isActive'];
    if (req.user.role === 'superadmin') {
      fieldsToUpdate.push('role');
    }

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kendi hesabını silme kontrolü
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });

  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcı istatistikleri
// @route   GET /api/users/stats
// @access  Private (Admin)
router.get('/admin/stats', adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleStats,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Kullanıcı istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;