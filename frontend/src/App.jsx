import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Settlements from './pages/Settlements';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
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
