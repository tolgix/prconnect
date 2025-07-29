const mongoose = require('mongoose');

const pressContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [100, 'İsim 100 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Görev unvanı 100 karakterden uzun olamaz']
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [100, 'Kurum adı 100 karakterden uzun olamaz']
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  socialLinks: {
    twitter: String,
    linkedin: String,
    instagram: String,
    facebook: String,
    youtube: String
  },
  beat: {
    type: String,
    enum: ['ekonomi', 'siyaset', 'teknoloji', 'spor', 'kültür', 'sağlık', 'eğitim', 'çevre', 'diğer'],
    default: 'diğer'
  },
  mediaType: {
    type: String,
    enum: ['gazete', 'dergi', 'tv', 'radyo', 'online', 'ajans', 'blog', 'podcast'],
    required: true
  },
  influence: {
    type: String,
    enum: ['düşük', 'orta', 'yüksek', 'çok_yüksek'],
    default: 'orta'
  },
  region: {
    type: String,
    enum: ['ulusal', 'istanbul', 'ankara', 'izmir', 'antalya', 'diğer'],
    default: 'ulusal'
  },
  language: {
    type: String,
    enum: ['tr', 'en', 'de', 'fr', 'ar'],
    default: 'tr'
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  preferredContactTime: {
    type: String,
    enum: ['sabah', 'öğlen', 'akşam', 'herhangi'],
    default: 'herhangi'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notlar 1000 karakterden uzun olamaz']
  },
  lastContactDate: {
    type: Date
  },
  contactHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'meeting', 'other'] },
    notes: String,
    campaignId: { type: mongoose.Schema.ObjectId, ref: 'Campaign' }
  }]
}, {
  timestamps: true
});

// İndeksler
pressContactSchema.index({ email: 1 });
pressContactSchema.index({ organization: 1 });
pressContactSchema.index({ beat: 1 });
pressContactSchema.index({ mediaType: 1 });
pressContactSchema.index({ region: 1 });
pressContactSchema.index({ isActive: 1 });

module.exports = mongoose.model('PressContact', pressContactSchema);