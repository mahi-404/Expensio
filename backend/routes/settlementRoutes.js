const express = require('express');
const router = express.Router();
const {
  getBalances,
  paySplit
} = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');

router.get('/balances', protect, getBalances);
router.post('/pay/:splitId', protect, paySplit);

module.exports = router;
