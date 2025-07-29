const express = require('express');
const { body, validationResult } = require('express-validator');
const PressContact = require('../models/PressContact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// @desc    Tüm basın kontaklarını getir
// @route   GET /api/press
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Aktiflik filtresi
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Medya tipi filtresi
    if (req.query.mediaType) {
      filter.mediaType = req.query.mediaType;
    }
    
    // Beats filtresi
    if (req.query.beat) {
      filter.beat = req.query.beat;
    }
    
    // Bölge filtresi
    if (req.query.region) {
      filter.region = req.query.region;
    }
    
    // Arama filtresi
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { organization: { $regex: req.query.search, $options: 'i' } },
        { jobTitle: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const pressContacts = await PressContact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PressContact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: pressContacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Basın kontakları listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Yeni basın kontağı oluştur
// @route   POST /api/press
// @access  Private (Manager/DataEntry)
router.post('/', authorize('superadmin', 'manager', 'dataentry'), [
  body('name').notEmpty().trim().withMessage('İsim gereklidir'),
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi gereklidir'),
  body('mediaType').isIn(['gazete', 'dergi', 'tv', 'radyo', 'online', 'ajans', 'blog', 'podcast'])
    .withMessage('Geçerli bir medya tipi seçiniz')
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

    // E-posta benzersizliği kontrolü
    const existingContact = await PressContact.findOne({ email: req.body.email });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı basın kontağı zaten mevcut'
      });
    }

    const pressContact = await PressContact.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Basın kontağı başarıyla oluşturuldu',
      data: pressContact
    });

  } catch (error) {
    console.error('Basın kontağı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Basın kontağı güncelle
// @route   PUT /api/press/:id
// @access  Private (Manager/DataEntry)
router.put('/:id', authorize('superadmin', 'manager', 'dataentry'), [
  body('name').optional().trim().notEmpty().withMessage('İsim boş olamaz'),
  body('email').optional().isEmail().withMessage('Geçerli bir e-posta adresi gereklidir')
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

    const pressContact = await PressContact.findById(req.params.id);

    if (!pressContact) {
      return res.status(404).json({
        success: false,
        message: 'Basın kontağı bulunamadı'
      });
    }

    // E-posta benzersizliği kontrolü
    if (req.body.email) {
      const existingContact = await PressContact.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi başka bir basın kontağı tarafından kullanılıyor'
        });
      }
    }

    const updatedContact = await PressContact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Basın kontağı başarıyla güncellendi',
      data: updatedContact
    });

  } catch (error) {
    console.error('Basın kontağı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Basın kontağı sil
// @route   DELETE /api/press/:id
// @access  Private (Manager/DataEntry)
router.delete('/:id', authorize('superadmin', 'manager', 'dataentry'), async (req, res) => {
  try {
    const pressContact = await PressContact.findById(req.params.id);

    if (!pressContact) {
      return res.status(404).json({
        success: false,
        message: 'Basın kontağı bulunamadı'
      });
    }

    await PressContact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Basın kontağı başarıyla silindi'
    });

  } catch (error) {
    console.error('Basın kontağı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Basın istatistikleri
// @route   GET /api/press/stats
// @access  Private
router.get('/admin/stats', async (req, res) => {
  try {
    const totalContacts = await PressContact.countDocuments();
    const activeContacts = await PressContact.countDocuments({ isActive: true });
    
    const mediaTypeStats = await PressContact.aggregate([
      {
        $group: {
          _id: '$mediaType',
          count: { $sum: 1 }
        }
      }
    ]);

    const beatStats = await PressContact.aggregate([
      {
        $group: {
          _id: '$beat',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalContacts,
        activeContacts,
        inactiveContacts: totalContacts - activeContacts,
        mediaTypeStats,
        beatStats
      }
    });

  } catch (error) {
    console.error('Basın istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;