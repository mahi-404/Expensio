const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getGroupExpenses,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addExpense)
  .get(protect, getExpenses);

router.get('/summary', protect, getExpenseSummary);
router.get('/group/:groupId', protect, getGroupExpenses);

module.exports = router;
