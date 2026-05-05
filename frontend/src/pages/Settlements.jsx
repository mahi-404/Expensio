import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { IndianRupee, CheckCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Settlements = () => {
  const [balances, setBalances] = useState({ othersOweUser: [], userOwesOthers: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await api.get('/settlements/balances');
      setBalances(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch balances', error);
      setLoading(false);
    }
  };

  const handlePay = async (split, app) => {
    try {
      const upiId = split.expense_id.paid_by.upi_id || 'default@upi';
      const name = encodeURIComponent(split.expense_id.paid_by.name);
      const amount = split.amount_owed;
      
      let upiLink = '';
      if (app === 'phonepe') {
        upiLink = `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
      } else if (app === 'gpay') {
        upiLink = `tez://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
      } else if (app === 'paytm') {
        upiLink = `paytmmp://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
      }
      
      // In a real mobile environment, this would open the respective UPI app.
      // For web simulation, we'll try to open it and then mark as paid.
      window.location.href = upiLink;
      
      // We assume payment is successful for this simulation
      if (window.confirm(`Simulating ${app.toUpperCase()} Payment of ₹${amount} to ${split.expense_id.paid_by.name}.\n\nMark as Paid?`)) {
        await api.post(`/settlements/pay/${split._id}`);
        fetchBalances(); // Refresh list
      }
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment failed');
    }
  };

  const handleMarkAsReceived = async (splitId) => {
    try {
      await api.post(`/settlements/pay/${splitId}`);
      fetchBalances();
    } catch (error) {
      console.error('Failed to mark as received', error);
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settlements</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* You Owe Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-6 h-6 text-red-500" />
            You Owe
          </h2>
          <div className="space-y-4">
            {balances.userOwesOthers.length > 0 ? (
              balances.userOwesOthers.map(split => (
                <div key={split._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{split.expense_id.paid_by.name}</h3>
                    <p className="text-sm text-gray-500">for {split.expense_id.description}</p>
                    <p className="text-lg font-bold text-red-500 mt-1">₹{split.amount_owed}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => handlePay(split, 'phonepe')}
                      className="px-3 py-2 bg-[#5f259f] hover:bg-[#4a1c7c] text-white text-xs font-medium rounded-lg shadow-sm transition-colors text-center"
                    >
                      PhonePe
                    </button>
                    <button
                      onClick={() => handlePay(split, 'gpay')}
                      className="px-3 py-2 bg-[#ea4335] hover:bg-[#d33426] text-white text-xs font-medium rounded-lg shadow-sm transition-colors text-center"
                    >
                      GPay
                    </button>
                    <button
                      onClick={() => handlePay(split, 'paytm')}
                      className="px-3 py-2 bg-[#00baf2] hover:bg-[#00a4d8] text-white text-xs font-medium rounded-lg shadow-sm transition-colors text-center"
                    >
                      Paytm
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">You're all settled up!</p>
              </div>
            )}
          </div>
        </div>

        {/* You Will Receive Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <ArrowDownLeft className="w-6 h-6 text-green-500" />
            You Will Receive
          </h2>
          <div className="space-y-4">
            {balances.othersOweUser.length > 0 ? (
              balances.othersOweUser.map(split => (
                <div key={split._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-green-100 dark:border-green-900/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{split.user_id.name}</h3>
                    <p className="text-sm text-gray-500">for {split.expense_id.description}</p>
                    <p className="text-lg font-bold text-green-500 mt-1">₹{split.amount_owed}</p>
                  </div>
                  <button
                    onClick={() => handleMarkAsReceived(split._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 text-sm font-medium rounded-lg transition-colors"
                  >
                    Mark as Received
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500">Nobody owes you anything.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settlements;
