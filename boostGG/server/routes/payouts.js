const express = require('express');
const { requestPayout, getMyPayouts, getAllPayouts, updatePayout } = require('../controllers/payoutController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/request', authorize('pro'), requestPayout);
router.get('/me', authorize('pro'), getMyPayouts);
router.get('/', authorize('admin'), getAllPayouts);
router.put('/:id', authorize('admin'), updatePayout);

module.exports = router;
