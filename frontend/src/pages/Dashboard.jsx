import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingDown, TrendingUp, IndianRupee } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [balances, setBalances] = useState({ othersOweUser: [], userOwesOthers: [] });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, balancesRes, expensesRes] = await Promise.all([
          api.get('/expenses/summary'),
          api.get('/settlements/balances'),
          api.get('/expenses')
        ]);
        
        setSummary(summaryRes.data);
        setBalances(balancesRes.data);
        setRecentExpenses(expensesRes.data.slice(0, 5)); // Top 5
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Spent</h3>
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
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h2>
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense._id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                    <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()} • {expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{expense.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-10">No recent transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
