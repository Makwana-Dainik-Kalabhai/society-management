const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: '18:00'
  },
  endTime: {
    type: String,
    default: '21:00'
  },
  venue: {
    type: String,
    default: 'Clubhouse / Community Hall'
  },
  maxAttendees: {
    type: Number,
    default: 100
  },
  coverImage: {
    type: String,
    default: ''
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registrations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attendees: {
      type: Number,
      default: 1
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
