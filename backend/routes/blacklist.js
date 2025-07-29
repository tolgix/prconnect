const express = require('express');
const { body, validationResult } = require('express-validator');
const Blacklist = require('../models/Blacklist');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// @desc    Kara liste girişlerini getir
// @route   GET /api/blacklist
// @access  Private (Manager/Admin)
router.get('/', authorize('superadmin', 'manager'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Aktiflik filtresi
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Sebep filtresi
    if (req.query.reason) {
      filter.reason = req.query.reason;
    }
    
    // Arama filtresi
    if (req.query.search) {
      filter.email = { $regex: req.query.search, $options: 'i' };
    }

    const blacklistEntries = await Blacklist.find(filter)
      .populate('addedBy', 'name email')
      .populate('campaignId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blacklist.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: blacklistEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Kara liste hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kara listeye e-posta ekle
// @route   POST /api/blacklist
// @access  Private (Manager/Admin)
router.post('/', authorize('superadmin', 'manager'), [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi gereklidir'),
  body('reason').isIn(['unsubscribe', 'bounce', 'spam_complaint', 'manual', 'invalid_email'])
    .withMessage('Geçerli bir sebep seçiniz')
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

    // E-posta zaten kara listede mi kontrol et
    const existingEntry = await Blacklist.findOne({ 
      email: req.body.email, 
      isActive: true 
    });
    
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kara listede bulunmaktadır'
      });
    }

    const blacklistEntry = await Blacklist.create({
      ...req.body,
      addedBy: req.user._id
    });

    await blacklistEntry.populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'E-posta adresi kara listeye eklendi',
      data: blacklistEntry
    });

  } catch (error) {
    console.error('Kara listeye ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kara listeden e-posta çıkar
// @route   DELETE /api/blacklist/:id
// @access  Private (Manager/Admin)
router.delete('/:id', authorize('superadmin', 'manager'), async (req, res) => {
  try {
    const blacklistEntry = await Blacklist.findById(req.params.id);

    if (!blacklistEntry) {
      return res.status(404).json({
        success: false,
        message: 'Kara liste girişi bulunamadı'
      });
    }

    // Kara liste girişini pasif yap (tamamen silme yerine)
    blacklistEntry.isActive = false;
    await blacklistEntry.save();

    res.status(200).json({
      success: true,
      message: 'E-posta adresi kara listeden çıkarıldı'
    });

  } catch (error) {
    console.error('Kara listeden çıkarma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    E-posta adresinin kara listede olup olmadığını kontrol et
// @route   GET /api/blacklist/check/:email
// @access  Private
router.get('/check/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    
    const blacklistEntry = await Blacklist.findOne({ 
      email, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      isBlacklisted: !!blacklistEntry,
      entry: blacklistEntry
    });

  } catch (error) {
    console.error('Kara liste kontrol hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Toplu kara liste işlemi
// @route   POST /api/blacklist/bulk
// @access  Private (Manager/Admin)
router.post('/bulk', authorize('superadmin', 'manager'), [
  body('emails').isArray({ min: 1 }).withMessage('En az bir e-posta adresi gereklidir'),
  body('emails.*').isEmail().withMessage('Tüm e-posta adresleri geçerli olmalıdır'),
  body('reason').isIn(['unsubscribe', 'bounce', 'spam_complaint', 'manual', 'invalid_email'])
    .withMessage('Geçerli bir sebep seçiniz')
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

    const { emails, reason, description } = req.body;
    const results = {
      added: [],
      existing: [],
      failed: []
    };

    for (const email of emails) {
      try {
        // E-posta zaten kara listede mi kontrol et
        const existingEntry = await Blacklist.findOne({ 
          email: email.toLowerCase(), 
          isActive: true 
        });
        
        if (existingEntry) {
          results.existing.push(email);
          continue;
        }

        // Kara listeye ekle
        const blacklistEntry = await Blacklist.create({
          email: email.toLowerCase(),
          reason,
          description,
          addedBy: req.user._id
        });

        results.added.push(email);

      } catch (error) {
        console.error(`${email} kara listeye eklenirken hata:`, error);
        results.failed.push(email);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Toplu kara liste işlemi tamamlandı',
      data: results
    });

  } catch (error) {
    console.error('Toplu kara liste hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kara liste istatistikleri
// @route   GET /api/blacklist/stats
// @access  Private (Manager/Admin)
router.get('/admin/stats', authorize('superadmin', 'manager'), async (req, res) => {
  try {
    const totalBlacklisted = await Blacklist.countDocuments({ isActive: true });
    
    const reasonStats = await Blacklist.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentEntries = await Blacklist.find({ isActive: true })
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalBlacklisted,
        reasonStats,
        recentEntries
      }
    });

  } catch (error) {
    console.error('Kara liste istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;