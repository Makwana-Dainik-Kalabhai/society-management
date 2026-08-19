const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerForEvent,
  getPolls,
  createPoll,
  voteOnPoll,
  getDocuments,
  createDocument
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Events
router.get('/events', protect, getEvents);
router.post('/events', protect, authorize('society_admin', 'main_admin'), createEvent);
router.post('/events/:id/register', protect, registerForEvent);

// Polls
router.get('/polls', protect, getPolls);
router.post('/polls', protect, authorize('society_admin', 'main_admin'), createPoll);
router.post('/polls/:id/vote', protect, voteOnPoll);

// Documents
router.get('/documents', protect, getDocuments);
router.post('/documents', protect, authorize('society_admin', 'main_admin'), createDocument);

module.exports = router;
