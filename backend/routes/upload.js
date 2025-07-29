const express = require('express');
const multer = require('multer');
const path = require('path');
const csvParser = require('csv-parser');
const fs = require('fs');
const Contact = require('../models/Contact');
const PressContact = require('../models/PressContact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    // Sadece CSV ve Excel dosyalarına izin ver
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Sadece CSV ve Excel dosyaları yüklenebilir'), false);
    }
  }
});

// @desc    Kontak listesi yükle (CSV)
// @route   POST /api/upload/contacts
// @access  Private (Manager/DataEntry)
router.post('/contacts', authorize('superadmin', 'manager', 'dataentry'), 
  upload.single('contactFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmesi gereklidir'
      });
    }

    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };

    const contacts = [];

    // CSV dosyasını parse et
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on('data', (data) => {
        results.total++;
        
        // Gerekli alanları kontrol et
        if (!data.name || !data.email) {
          results.errors.push(`Satır ${results.total}: İsim ve e-posta gereklidir`);
          results.skipped++;
          return;
        }

        // E-posta formatını kontrol et
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(data.email)) {
          results.errors.push(`Satır ${results.total}: Geçersiz e-posta formatı - ${data.email}`);
          results.skipped++;
          return;
        }

        contacts.push({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          organization: data.organization || '',
          position: data.position || '',
          phone: data.phone || '',
          notes: data.notes || '',
          source: 'import'
        });
      })
      .on('end', async () => {
        try {
          // Kontakları veritabanına kaydet
          for (const contactData of contacts) {
            try {
              // E-posta benzersizliği kontrolü
              const existingContact = await Contact.findOne({ email: contactData.email });
              if (existingContact) {
                results.skipped++;
                results.errors.push(`E-posta zaten mevcut: ${contactData.email}`);
                continue;
              }

              await Contact.create(contactData);
              results.imported++;
            } catch (error) {
              results.skipped++;
              results.errors.push(`${contactData.email}: ${error.message}`);
            }
          }

          // Geçici dosyayı sil
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            message: 'Kontak importu tamamlandı',
            data: results
          });

        } catch (error) {
          console.error('Kontak import hatası:', error);
          res.status(500).json({
            success: false,
            message: 'Import işlemi sırasında hata oluştu'
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV parse hatası:', error);
        res.status(400).json({
          success: false,
          message: 'CSV dosyası işlenirken hata oluştu'
        });
      });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme sırasında hata oluştu'
    });
  }
});

// @desc    Basın kontakları yükle (CSV)
// @route   POST /api/upload/press
// @access  Private (Manager/DataEntry)
router.post('/press', authorize('superadmin', 'manager', 'dataentry'), 
  upload.single('pressFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmesi gereklidir'
      });
    }

    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };

    const pressContacts = [];

    // CSV dosyasını parse et
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on('data', (data) => {
        results.total++;
        
        // Gerekli alanları kontrol et
        if (!data.name || !data.email || !data.mediaType) {
          results.errors.push(`Satır ${results.total}: İsim, e-posta ve medya tipi gereklidir`);
          results.skipped++;
          return;
        }

        // E-posta formatını kontrol et
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(data.email)) {
          results.errors.push(`Satır ${results.total}: Geçersiz e-posta formatı - ${data.email}`);
          results.skipped++;
          return;
        }

        // Medya tipi kontrolü
        const validMediaTypes = ['gazete', 'dergi', 'tv', 'radyo', 'online', 'ajans', 'blog', 'podcast'];
        if (!validMediaTypes.includes(data.mediaType)) {
          results.errors.push(`Satır ${results.total}: Geçersiz medya tipi - ${data.mediaType}`);
          results.skipped++;
          return;
        }

        pressContacts.push({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          jobTitle: data.jobTitle || '',
          organization: data.organization || '',
          phone: data.phone || '',
          website: data.website || '',
          mediaType: data.mediaType,
          beat: data.beat || 'diğer',
          region: data.region || 'ulusal',
          influence: data.influence || 'orta',
          language: data.language || 'tr',
          notes: data.notes || ''
        });
      })
      .on('end', async () => {
        try {
          // Basın kontaklarını veritabanına kaydet
          for (const contactData of pressContacts) {
            try {
              // E-posta benzersizliği kontrolü
              const existingContact = await PressContact.findOne({ email: contactData.email });
              if (existingContact) {
                results.skipped++;
                results.errors.push(`E-posta zaten mevcut: ${contactData.email}`);
                continue;
              }

              await PressContact.create(contactData);
              results.imported++;
            } catch (error) {
              results.skipped++;
              results.errors.push(`${contactData.email}: ${error.message}`);
            }
          }

          // Geçici dosyayı sil
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            message: 'Basın kontakları importu tamamlandı',
            data: results
          });

        } catch (error) {
          console.error('Basın kontakları import hatası:', error);
          res.status(500).json({
            success: false,
            message: 'Import işlemi sırasında hata oluştu'
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV parse hatası:', error);
        res.status(400).json({
          success: false,
          message: 'CSV dosyası işlenirken hata oluştu'
        });
      });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme sırasında hata oluştu'
    });
  }
});

// @desc    Kampanya eki yükle
// @route   POST /api/upload/attachment
// @access  Private (Manager/DataEntry)
router.post('/attachment', authorize('superadmin', 'manager', 'dataentry'), 
  upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmesi gereklidir'
      });
    }

    const fileInfo = {
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    res.status(200).json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      data: fileInfo
    });

  } catch (error) {
    console.error('Ek dosyası yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme sırasında hata oluştu'
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'Dosya yükleme hatası'
  });
});

module.exports = router;