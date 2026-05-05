import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingDown, TrendingUp, IndianRupee } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];
const CATEGORIES = ['All', 'Food', 'Travel', 'Hostel', 'Study', 'Entertainment', 'Other'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [balances, setBalances] = useState({ othersOweUser: [], userOwesOthers: [] });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'All', startDate: '', endDate: '' });
  
  // Budget States
  const [newBudget, setNewBudget] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const [summaryRes, balancesRes, expensesRes] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/settlements/balances'),
        api.get(`/expenses?${params.toString()}`)
      ]);
      
      setSummary(summaryRes.data);
      setBalances(balancesRes.data);
      setRecentExpenses(expensesRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateBudget = async () => {
    try {
      await api.put('/auth/budget', { budget: newBudget });
      setIsEditingBudget(false);
      fetchData(); // refresh summary
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  const totalOwedToUser = balances.othersOweUser.reduce((acc, curr) => acc + curr.amount_owed, 0);
  const totalUserOwes = balances.userOwesOthers.reduce((acc, curr) => acc + curr.amount_owed, 0);

  const chartData = summary?.categorySummary?.map((item) => ({
    name: item._id,
    value: item.total
  })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hello, {user.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Spent (All Time)</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{summary?.totalAmount || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">You are owed</h3>
            <div className="p-2 bg-green-100 text-green-600 rounded-full">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">₹{totalOwedToUser}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">You owe</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-full">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-500">₹{totalUserOwes}</p>
        </div>
      </div>

      {/* Budget Tracker */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budget</h2>
          {!isEditingBudget ? (
            <button onClick={() => { setIsEditingBudget(true); setNewBudget(summary?.budget || ''); }} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
              {summary?.budget > 0 ? 'Edit Budget' : 'Set Budget'}
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Amount (₹)"
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm w-full sm:w-32 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button onClick={handleUpdateBudget} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Save</button>
              <button onClick={() => setIsEditingBudget(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          )}
        </div>
        
        {summary?.budget > 0 ? (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">Spent this month: <span className="font-bold text-gray-900 dark:text-white">₹{summary?.currentMonthTotal || 0}</span></span>
              <span className="text-gray-600 dark:text-gray-300">Budget: <span className="font-bold text-gray-900 dark:text-white">₹{summary?.budget}</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-3 transition-all duration-500 ${summary?.currentMonthTotal > summary?.budget ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((summary?.currentMonthTotal / summary?.budget) * 100, 100)}%` }}
              ></div>
            </div>
            {summary?.currentMonthTotal > summary?.budget && (
              <p className="text-red-500 text-sm mt-3 font-medium flex items-center gap-1">
                ⚠️ You have crossed your monthly budget!
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No budget set for this month. Set one to track your spending!</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expenses by Category</h2>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-10">No expenses yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions & Filters</h2>
            
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {recentExpenses.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {recentExpenses.map((expense) => (
                <div key={expense._id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded mr-2">{expense.category}</span>
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{expense.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No transactions match your filters.</p>
              <button 
                onClick={() => setFilters({ category: 'All', startDate: '', endDate: '' })}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
