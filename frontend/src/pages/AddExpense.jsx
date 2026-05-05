import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AddExpense = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Other',
    group_id: '',
    splitType: 'equal', // 'equal' or 'unequal'
  });
  const [splits, setSplits] = useState([]); // Array of {user_id, amount_owed, name}
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups');
        setGroups(res.data);
      } catch (error) {
        console.error('Failed to fetch groups', error);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupChange = async (e) => {
    const groupId = e.target.value;
    setFormData({ ...formData, group_id: groupId });
    
    if (groupId) {
      try {
        const res = await api.get(`/groups/${groupId}`);
        setSelectedGroup(res.data);
        
        // Initialize splits for equal division
        const initialSplits = res.data.members.map(member => ({
          user_id: member._id,
          name: member.name,
          amount_owed: 0
        }));
        setSplits(initialSplits);
      } catch (error) {
        console.error('Failed to fetch group details', error);
      }
    } else {
      setSelectedGroup(null);
      setSplits([]);
    }
  };

  // Recalculate equal split when amount or split type changes
  useEffect(() => {
    if (selectedGroup && formData.amount && formData.splitType === 'equal') {
      const perPerson = (parseFloat(formData.amount) / selectedGroup.members.length).toFixed(2);
      setSplits(splits.map(s => ({ ...s, amount_owed: parseFloat(perPerson) })));
    }
  }, [formData.amount, formData.splitType, selectedGroup]);

  const handleSplitChange = (userId, value) => {
    setSplits(splits.map(s => s.user_id === userId ? { ...s, amount_owed: parseFloat(value) || 0 } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate unequal splits
      if (formData.group_id && formData.splitType === 'unequal') {
        const totalSplit = splits.reduce((acc, curr) => acc + curr.amount_owed, 0);
        if (Math.abs(totalSplit - parseFloat(formData.amount)) > 0.1) {
          alert("Split amounts don't add up to the total amount!");
          return;
        }
      }

      await api.post('/expenses', {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        group_id: formData.group_id || null,
        splits: formData.group_id ? splits : []
      });

      navigate(formData.group_id ? `/groups/${formData.group_id}` : '/');
    } catch (error) {
      console.error('Failed to add expense', error);
      alert('Failed to add expense');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add Expense</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="E.g. Dinner at Burger King"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Hostel">Hostel</option>
                <option value="Study">Study</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group (Optional)</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.group_id}
              onChange={handleGroupChange}
            >
              <option value="">Personal Expense (No Group)</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.group_name}</option>
              ))}
            </select>
          </div>

          {selectedGroup && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Split Details</h3>
                <div className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm ${formData.splitType === 'equal' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                  >
                    Equal
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm ${formData.splitType === 'unequal' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setFormData({ ...formData, splitType: 'unequal' })}
                  >
                    Unequal
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {splits.map((split) => (
                  <div key={split.user_id} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {split.user_id === user.id ? 'You' : split.name}
                    </span>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={formData.splitType === 'equal'}
                        className={`w-24 px-2 py-1 border rounded text-right ${formData.splitType === 'equal' ? 'bg-gray-100 dark:bg-gray-600 border-transparent' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-500 focus:border-primary focus:ring-1 focus:ring-primary'} dark:text-white`}
                        value={split.amount_owed === 0 ? '' : split.amount_owed}
                        onChange={(e) => handleSplitChange(split.user_id, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
