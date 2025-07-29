const express = require('express');
const { body, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const { protect, authorize } = require('../middleware/auth');
const { sendBulkEmails } = require('../utils/sendEmail');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// @desc    Tüm kampanyaları listele
// @route   GET /api/campaigns
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Sadece kendi kampanyalarını görebilsin (admin hariç)
    if (req.user.role !== 'superadmin') {
      filter.createdBy = req.user._id;
    }
    
    // Status filtresi
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Arama filtresi
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(filter)
      .populate('createdBy', 'name email')
      .populate('targetLists', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Campaign.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Kampanya listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Tek kampanya getir
// @route   GET /api/campaigns/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('targetLists', 'name contactCount')
      .populate('targetSegments', 'name');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Kampanya bulunamadı'
      });
    }

    // Kendi kampanyası değilse ve admin değilse erişim engelle
    if (req.user.role !== 'superadmin' && 
        campaign.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu kampanyaya erişim yetkiniz bulunmamaktadır'
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Kampanya getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Yeni kampanya oluştur
// @route   POST /api/campaigns
// @access  Private (Manager/DataEntry)
router.post('/', authorize('superadmin', 'manager', 'dataentry'), [
  body('name').notEmpty().trim().withMessage('Kampanya adı gereklidir'),
  body('subject').notEmpty().trim().withMessage('E-posta konusu gereklidir'),
  body('senderName').notEmpty().trim().withMessage('Gönderen adı gereklidir'),
  body('senderEmail').isEmail().withMessage('Geçerli bir gönderen e-postası gereklidir'),
  body('content').notEmpty().withMessage('Kampanya içeriği gereklidir')
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

    const campaign = await Campaign.create({
      ...req.body,
      createdBy: req.user._id
    });

    await campaign.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Kampanya başarıyla oluşturuldu',
      data: campaign
    });

  } catch (error) {
    console.error('Kampanya oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kampanya güncelle
// @route   PUT /api/campaigns/:id
// @access  Private (Owner/Admin)
router.put('/:id', authorize('superadmin', 'manager', 'dataentry'), [
  body('name').optional().trim().notEmpty().withMessage('Kampanya adı boş olamaz'),
  body('subject').optional().trim().notEmpty().withMessage('E-posta konusu boş olamaz'),
  body('senderEmail').optional().isEmail().withMessage('Geçerli bir gönderen e-postası gereklidir')
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

    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Kampanya bulunamadı'
      });
    }

    // Kendi kampanyası değilse ve admin değilse erişim engelle
    if (req.user.role !== 'superadmin' && 
        campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu kampanyayı güncelleme yetkiniz bulunmamaktadır'
      });
    }

    // Gönderilmiş kampanyalar güncellenemez
    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Gönderilmiş kampanyalar güncellenemez'
      });
    }

    campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Kampanya başarıyla güncellendi',
      data: campaign
    });

  } catch (error) {
    console.error('Kampanya güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kampanya sil
// @route   DELETE /api/campaigns/:id
// @access  Private (Owner/Admin)
router.delete('/:id', authorize('superadmin', 'manager', 'dataentry'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Kampanya bulunamadı'
      });
    }

    // Kendi kampanyası değilse ve admin değilse erişim engelle
    if (req.user.role !== 'superadmin' && 
        campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu kampanyayı silme yetkiniz bulunmamaktadır'
      });
    }

    // Gönderilmiş kampanyalar silinemez
    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Gönderilmiş kampanyalar silinemez'
      });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Kampanya başarıyla silindi'
    });

  } catch (error) {
    console.error('Kampanya silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kampanya gönder
// @route   POST /api/campaigns/:id/send
// @access  Private (Manager/DataEntry)
router.post('/:id/send', authorize('superadmin', 'manager', 'dataentry'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('targetLists')
      .populate('targetSegments');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Kampanya bulunamadı'
      });
    }

    // Kendi kampanyası değilse ve admin değilse erişim engelle
    if (req.user.role !== 'superadmin' && 
        campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu kampanyayı gönderme yetkiniz bulunmamaktadır'
      });
    }

    // Kampanya durumu kontrol et
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Sadece taslak veya zamanlanmış kampanyalar gönderilebilir'
      });
    }

    // TODO: Gerçek e-posta gönderimi implementasyonu
    // Şimdilik sadece status'u güncelle
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.analytics.totalSent = 100; // Mock data
    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Kampanya başarıyla gönderildi',
      data: campaign
    });

  } catch (error) {
    console.error('Kampanya gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kampanya istatistikleri
// @route   GET /api/campaigns/stats
// @access  Private
router.get('/admin/stats', async (req, res) => {
  try {
    const filter = {};
    
    // Sadece kendi kampanyalarını görebilsin (admin hariç)
    if (req.user.role !== 'superadmin') {
      filter.createdBy = req.user._id;
    }

    const totalCampaigns = await Campaign.countDocuments(filter);
    const sentCampaigns = await Campaign.countDocuments({ ...filter, status: 'sent' });
    const draftCampaigns = await Campaign.countDocuments({ ...filter, status: 'draft' });
    
    const recentCampaigns = await Campaign.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalCampaigns,
        sentCampaigns,
        draftCampaigns,
        recentCampaigns
      }
    });

  } catch (error) {
    console.error('Kampanya istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;