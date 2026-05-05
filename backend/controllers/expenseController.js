const Expense = require('../models/Expense');
const ExpenseSplit = require('../models/ExpenseSplit');
const Group = require('../models/Group');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { description, amount, category, date, group_id, splits } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ message: 'Please provide description and amount' });
    }

    // Create the expense
    const expense = await Expense.create({
      description,
      amount,
      category,
      date: date || Date.now(),
      paid_by: req.user.id,
      group_id: group_id || null,
    });

    // If it's a group expense, handle splits
    if (group_id && splits && splits.length > 0) {
      const splitPromises = splits.map(async (split) => {
        // Don't create a split for the person who paid, unless we want to track it
        if (split.user_id !== req.user.id && split.amount_owed > 0) {
          return ExpenseSplit.create({
            expense_id: expense._id,
            user_id: split.user_id,
            amount_owed: split.amount_owed,
          });
        }
      });
      await Promise.all(splitPromises);
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get personal/user expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    
    // Build query object
    let query = {
      paid_by: req.user.id,
      group_id: null
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group expenses
// @route   GET /api/expenses/group/:groupId
// @access  Private
const getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group_id: req.params.groupId })
      .populate('paid_by', 'name email')
      .sort({ date: -1 });
    
    // Get splits for these expenses
    const expenseIds = expenses.map(e => e._id);
    const splits = await ExpenseSplit.find({ expense_id: { $in: expenseIds } })
      .populate('user_id', 'name');

    res.status(200).json({ expenses, splits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense summary
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Basic summary: total amount grouped by category for the user
    const summary = await Expense.aggregate([
      {
        $match: {
          paid_by: req.user._id, // Match the mongoose ObjectId
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const total = await Expense.aggregate([
      {
        $match: { paid_by: req.user._id }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: { 
          paid_by: req.user._id,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get user to return their budget
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    res.status(200).json({
      categorySummary: summary,
      totalAmount: total.length > 0 ? total[0].totalAmount : 0,
      currentMonthTotal: currentMonthExpenses.length > 0 ? currentMonthExpenses[0].totalAmount : 0,
      budget: user.monthly_budget || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getGroupExpenses,
  getExpenseSummary
};
