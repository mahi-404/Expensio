const mongoose = require('mongoose');

const ExpenseSplitSchema = new mongoose.Schema({
  expense_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount_owed: {
    type: Number,
    required: true,
  },
  is_paid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ExpenseSplit', ExpenseSplitSchema);
