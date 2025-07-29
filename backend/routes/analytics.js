const express = require('express');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Contact = require('../models/Contact');
const PressContact = require('../models/PressContact');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// @desc    Genel dashboard istatistikleri
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const filter = {};
    
    // Sadece kendi verilerini görebilsin (admin hariç)
    if (req.user.role !== 'superadmin') {
      filter.createdBy = req.user._id;
    }

    // Kampanya istatistikleri
    const totalCampaigns = await Campaign.countDocuments(filter);
    const sentCampaigns = await Campaign.countDocuments({ ...filter, status: 'sent' });
    const draftCampaigns = await Campaign.countDocuments({ ...filter, status: 'draft' });
    
    // E-posta istatistikleri
    const emailStats = await Campaign.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$analytics.totalSent' },
          totalOpened: { $sum: '$analytics.opened' },
          totalClicked: { $sum: '$analytics.clicked' }
        }
      }
    ]);

    const totalSent = emailStats[0]?.totalSent || 0;
    const totalOpened = emailStats[0]?.totalOpened || 0;
    const totalClicked = emailStats[0]?.totalClicked || 0;
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : 0;

    // İletişim istatistikleri
    const totalContacts = await Contact.countDocuments();
    const activeContacts = await Contact.countDocuments({ isActive: true });
    
    // Basın kontakları
    const totalPressContacts = await PressContact.countDocuments();
    const activePressContacts = await PressContact.countDocuments({ isActive: true });

    // Son kampanyalar
    const recentCampaigns = await Campaign.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        campaigns: {
          total: totalCampaigns,
          sent: sentCampaigns,
          draft: draftCampaigns
        },
        emails: {
          totalSent,
          totalOpened,
          totalClicked,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate)
        },
        contacts: {
          total: totalContacts,
          active: activeContacts
        },
        pressContacts: {
          total: totalPressContacts,
          active: activePressContacts
        },
        recentCampaigns
      }
    });

  } catch (error) {
    console.error('Dashboard istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kampanya performans analitikleri
// @route   GET /api/analytics/campaigns
// @access  Private
router.get('/campaigns', async (req, res) => {
  try {
    const filter = {};
    
    // Sadece kendi kampanyalarını görebilsin (admin hariç)
    if (req.user.role !== 'superadmin') {
      filter.createdBy = req.user._id;
    }

    // Tarih filtresi
    if (req.query.startDate && req.query.endDate) {
      filter.sentAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Aylık kampanya performansı
    const monthlyStats = await Campaign.aggregate([
      { $match: { ...filter, status: 'sent' } },
      {
        $group: {
          _id: {
            year: { $year: '$sentAt' },
            month: { $month: '$sentAt' }
          },
          totalCampaigns: { $sum: 1 },
          totalSent: { $sum: '$analytics.totalSent' },
          totalOpened: { $sum: '$analytics.opened' },
          totalClicked: { $sum: '$analytics.clicked' },
          avgOpenRate: { $avg: '$analytics.openRate' },
          avgClickRate: { $avg: '$analytics.clickRate' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // En iyi performans gösteren kampanyalar
    const topCampaigns = await Campaign.find({ ...filter, status: 'sent' })
      .sort({ 'analytics.openRate': -1 })
      .limit(10)
      .select('name subject analytics.openRate analytics.clickRate analytics.totalSent sentAt');

    res.status(200).json({
      success: true,
      data: {
        monthlyStats,
        topCampaigns
      }
    });

  } catch (error) {
    console.error('Kampanya analitikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcı analitikleri (sadece admin)
// @route   GET /api/analytics/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Bu analitiklere erişim yetkiniz bulunmamaktadır'
      });
    }

    // Rol dağılımı
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Aktif/Pasif kullanıcılar
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Kullanıcı aktivitesi (kampanya oluşturma)
    const userActivity = await Campaign.aggregate([
      {
        $group: {
          _id: '$createdBy',
          campaignCount: { $sum: 1 },
          sentCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          campaignCount: 1,
          sentCampaigns: 1
        }
      },
      { $sort: { campaignCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleStats,
        userActivity
      }
    });

  } catch (error) {
    console.error('Kullanıcı analitikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;