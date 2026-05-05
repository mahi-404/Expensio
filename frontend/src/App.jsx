import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Settlements from './pages/Settlements';
import api from './services/api';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Sync offline expenses
      const offlineExpenses = JSON.parse(localStorage.getItem('offlineExpenses') || '[]');
      if (offlineExpenses.length > 0) {
        try {
          for (const exp of offlineExpenses) {
            // remove offlineId before sending
            const { offlineId, ...payload } = exp;
            await api.post('/expenses', payload);
          }
          localStorage.removeItem('offlineExpenses');
          // Optional: You could use a toast notification here instead of alert
          console.log(`Successfully synced ${offlineExpenses.length} offline expenses!`);
        } catch (error) {
          console.error("Failed to sync offline expenses", error);
        }
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try sync on initial load if online
    if (navigator.onLine) handleOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 text-sm font-medium sticky top-0 z-50 shadow-md">
          ⚠️ Offline Mode Active. Changes are saved locally and will sync when internet is restored.
        </div>
      )}
      {user && <Navbar />}
      <div className={user ? "pb-16 sm:pb-0" : ""}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-expense" element={<PrivateRoute><AddExpense /></PrivateRoute>} />
          <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
          <Route path="/groups/:id" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
          <Route path="/settlements" element={<PrivateRoute><Settlements /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
