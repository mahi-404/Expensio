const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['Food', 'Travel', 'Hostel', 'Study', 'Entertainment', 'Other'],
    default: 'Other',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paid_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null, // null means it's a personal expense
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
