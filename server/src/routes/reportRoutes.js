const express = require('express');
const router = express.Router();
const { getReportsOverview } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/overview', protect, authorize('main_admin', 'society_admin'), getReportsOverview);

module.exports = router;
