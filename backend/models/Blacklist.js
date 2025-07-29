const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  reason: {
    type: String,
    enum: ['unsubscribe', 'bounce', 'spam_complaint', 'manual', 'invalid_email'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
  },
  addedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  campaignId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign'
  },
  bounceType: {
    type: String,
    enum: ['hard', 'soft', 'block']
  },
  bounceCount: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// İndeksler
blacklistSchema.index({ email: 1 });
blacklistSchema.index({ reason: 1 });
blacklistSchema.index({ isActive: 1 });

module.exports = mongoose.model('Blacklist', blacklistSchema);