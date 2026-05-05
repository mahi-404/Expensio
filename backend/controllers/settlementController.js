const Expense = require('../models/Expense');
const ExpenseSplit = require('../models/ExpenseSplit');
const User = require('../models/User');

// @desc    Get user balances (Who owes you, Who you owe)
// @route   GET /api/settlements/balances
// @access  Private
const getBalances = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. What others owe the user
    // Find expenses paid by the user
    const expensesPaidByUser = await Expense.find({ paid_by: userId });
    const expenseIds = expensesPaidByUser.map(e => e._id);
    
    // Find unpaid splits for these expenses
    const othersOweUser = await ExpenseSplit.find({ 
      expense_id: { $in: expenseIds },
      is_paid: false 
    }).populate('user_id', 'name upi_id').populate('expense_id', 'description amount group_id');

    // 2. What the user owes others
    // Find unpaid splits where user is the one owing
    const userOwesOthers = await ExpenseSplit.find({
      user_id: userId,
      is_paid: false
    }).populate('expense_id', 'description amount paid_by group_id');

    // To get the person who the user owes, we need to populate paid_by from the expense
    await Expense.populate(userOwesOthers, {
      path: 'expense_id.paid_by',
      select: 'name upi_id',
      model: User
    });

    res.status(200).json({
      othersOweUser,
      userOwesOthers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a split as paid
// @route   POST /api/settlements/pay/:splitId
// @access  Private
const paySplit = async (req, res) => {
  try {
    const split = await ExpenseSplit.findById(req.params.splitId);

    if (!split) {
      return res.status(404).json({ message: 'Split not found' });
    }

    // Verify that the person marking it as paid is the one who owes or the one who paid
    // Ideally, only the person who receives money or the person who pays should mark it
    // For simplicity, we allow the user who owes to mark it as paid (after UPI payment)
    
    if (split.user_id.toString() !== req.user.id) {
       // Also check if they are the one who created the expense
       const expense = await Expense.findById(split.expense_id);
       if(expense.paid_by.toString() !== req.user.id) {
         return res.status(401).json({ message: 'Not authorized' });
       }
    }

    split.is_paid = true;
    await split.save();

    res.status(200).json(split);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBalances,
  paySplit
};
