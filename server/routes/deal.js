const express = require('express');
const router = express.Router();
const { getDeals, getDeal, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDeals);
router.get('/:id', getDeal);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

module.exports = router;
