const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kampanya adı gereklidir'],
    trim: true,
    maxlength: [200, 'Kampanya adı 200 karakterden uzun olamaz']
  },
  subject: {
    type: String,
    required: [true, 'E-posta konusu gereklidir'],
    trim: true,
    maxlength: [200, 'Konu 200 karakterden uzun olamaz']
  },
  senderName: {
    type: String,
    required: [true, 'Gönderen adı gereklidir'],
    trim: true,
    maxlength: [100, 'Gönderen adı 100 karakterden uzun olamaz']
  },
  senderEmail: {
    type: String,
    required: [true, 'Gönderen e-postası gereklidir'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  content: {
    type: String,
    required: [true, 'Kampanya içeriği gereklidir']
  },
  plainTextContent: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  targetLists: [{
    type: mongoose.Schema.ObjectId,
    ref: 'ContactList'
  }],
  targetSegments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Segment'
  }],
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'Template'
  },
  analytics: {
    totalSent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }
  },
  tags: [String],
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    mimeType: String
  }],
  settings: {
    trackOpens: { type: Boolean, default: true },
    trackClicks: { type: Boolean, default: true },
    unsubscribeLink: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// İndeksler
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ sentAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);