const mongoose = require('mongoose');

const contactListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Liste adı gereklidir'],
    trim: true,
    maxlength: [100, 'Liste adı 100 karakterden uzun olamaz']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contactCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  settings: {
    allowDuplicates: { type: Boolean, default: false },
    autoCleanup: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// İndeksler
contactListSchema.index({ name: 1 });
contactListSchema.index({ createdBy: 1 });
contactListSchema.index({ isActive: 1 });

module.exports = mongoose.model('ContactList', contactListSchema);