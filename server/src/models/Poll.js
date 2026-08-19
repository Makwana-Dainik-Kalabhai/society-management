const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    votesCount: {
      type: Number,
      default: 0
    }
  }],
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    optionIndex: {
      type: Number,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
