import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      // Exclude current user from the list
      setAllUsers(res.data.filter(u => u._id !== user.id));
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', {
        group_name: newGroupName,
        members: selectedMembers
      });
      setIsModalOpen(false);
      setNewGroupName('');
      setSelectedMembers([]);
      fetchGroups();
    } catch (error) {
      console.error('Failed to create group', error);
      alert('Failed to create group');
    }
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Groups</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Create Group
        </button>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group-hover:border-primary cursor-pointer block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{group.group_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{group.members.length} Members</p>
                </div>
              </div>
              <div className="flex -space-x-2 overflow-hidden mt-4">
                {group.members.slice(0, 4).map((member) => (
                  <div key={member._id} className="inline-block h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {group.members.length > 4 && (
                  <div className="inline-block h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-500">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No groups yet</h3>
          <p className="text-gray-500 mt-1">Create a group to start splitting expenses.</p>
        </div>
      )}

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Goa Trip, Roommates"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Members</label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {allUsers.map(u => (
                    <div key={u._id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer" onClick={() => toggleMember(u._id)}>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{u.email}</span>
                    </div>
                  ))}
                  {allUsers.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">No other users found.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
