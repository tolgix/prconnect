const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [100, 'İsim 100 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [100, 'Kurum adı 100 karakterden uzun olamaz']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Pozisyon 100 karakterden uzun olamaz']
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
    facebook: String
  },
  contactLists: [{
    type: mongoose.Schema.ObjectId,
    ref: 'ContactList'
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  unsubscribedAt: {
    type: Date
  },
  bounceCount: {
    type: Number,
    default: 0
  },
  lastEmailSent: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notlar 500 karakterden uzun olamaz']
  },
  source: {
    type: String,
    enum: ['manual', 'import', 'api', 'signup'],
    default: 'manual'
  },
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Unique index for email within each contact list
contactSchema.index({ email: 1, contactLists: 1 }, { unique: true });
contactSchema.index({ organization: 1 });
contactSchema.index({ isActive: 1 });
contactSchema.index({ tags: 1 });

module.exports = mongoose.model('Contact', contactSchema);