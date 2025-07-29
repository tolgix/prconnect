const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const ContactList = require('../models/ContactList');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// @desc    Tüm iletişim listelerini getir
// @route   GET /api/contacts/lists
// @access  Private
router.get('/lists', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Sadece kendi listelerini görebilsin (admin hariç)
    if (req.user.role !== 'superadmin') {
      filter.createdBy = req.user._id;
    }
    
    // Arama filtresi
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const lists = await ContactList.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactList.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: lists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('İletişim listeleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Yeni iletişim listesi oluştur
// @route   POST /api/contacts/lists
// @access  Private (Manager/DataEntry)
router.post('/lists', authorize('superadmin', 'manager', 'dataentry'), [
  body('name').notEmpty().trim().withMessage('Liste adı gereklidir'),
  body('description').optional().trim()
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

    const contactList = await ContactList.create({
      ...req.body,
      createdBy: req.user._id
    });

    await contactList.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'İletişim listesi başarıyla oluşturuldu',
      data: contactList
    });

  } catch (error) {
    console.error('İletişim listesi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Tüm kontakları getir
// @route   GET /api/contacts
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Liste filtresi
    if (req.query.listId) {
      filter.contactLists = req.query.listId;
    }
    
    // Aktiflik filtresi
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Arama filtresi
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { organization: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter)
      .populate('contactLists', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Kontak listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Yeni kontak oluştur
// @route   POST /api/contacts
// @access  Private (Manager/DataEntry)
router.post('/', authorize('superadmin', 'manager', 'dataentry'), [
  body('name').notEmpty().trim().withMessage('İsim gereklidir'),
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi gereklidir')
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

    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Kontak başarıyla oluşturuldu',
      data: contact
    });

  } catch (error) {
    console.error('Kontak oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;