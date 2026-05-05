import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Receipt, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [groupRes, expensesRes] = await Promise.all([
          api.get(`/groups/${id}`),
          api.get(`/expenses/group/${id}`)
        ]);
        setGroup(groupRes.data);
        setExpenses(expensesRes.data.expenses);
        setSplits(expensesRes.data.splits);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch group details', error);
        setLoading(false);
      }
    };
    fetchGroupData();
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!group) return <div className="text-center p-10">Group not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              {group.group_name}
            </h1>
            <p className="text-gray-500 mt-2">
              {group.members.length} Members: {group.members.map(m => m.name).join(', ')}
            </p>
          </div>
          <Link
            to="/add-expense"
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Expense
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-gray-500" />
            Group Expenses
          </h2>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map(expense => (
                <div key={expense._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{expense.description}</h3>
                    <p className="text-sm text-gray-500">
                      Paid by <span className="font-medium text-gray-700 dark:text-gray-300">{expense.paid_by.name === user.name ? 'You' : expense.paid_by.name}</span>
                      {' • '} {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹{expense.amount}</p>
                    <p className="text-xs text-gray-500">{expense.category}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 text-center">No expenses in this group yet.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Split Details</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            {splits.length > 0 ? (
              splits.map(split => {
                const expense = expenses.find(e => e._id === split.expense_id);
                if (!expense) return null;
                const isUserOwing = split.user_id._id === user.id;
                const isUserReceiving = expense.paid_by._id === user.id;
                
                // Only show splits relevant to current user to avoid clutter, or show all.
                // Let's show all for transparency
                return (
                  <div key={split._id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{split.user_id.name}</span>
                      <span className="text-gray-500"> owes </span>
                      <span className="font-medium text-gray-900 dark:text-white">{expense.paid_by.name}</span>
                      <p className="text-xs text-gray-400 mt-1">for {expense.description}</p>
                    </div>
                    <div className={`font-semibold ${split.is_paid ? 'text-gray-400 line-through' : (isUserOwing ? 'text-red-500' : isUserReceiving ? 'text-green-500' : 'text-gray-700 dark:text-gray-300')}`}>
                      ₹{split.amount_owed}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-sm text-center">No splits calculated.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
