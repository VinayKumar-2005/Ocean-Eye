const express = require('express');
const router = express.Router();
const { getReports, createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getReports);
router.post('/', protect, upload.single('image'), createReport);

module.exports = router;