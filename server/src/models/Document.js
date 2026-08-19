const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['bylaws', 'policy', 'financial', 'legal', 'meeting_minutes', 'forms', 'guidelines'],
    default: 'guidelines'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    default: '1.2 MB'
  },
  fileType: {
    type: String,
    default: 'pdf'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
