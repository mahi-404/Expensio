import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, PieChart, Users, PlusCircle, CreditCard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-surface border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <PieChart className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                Expensio
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-900 dark:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/groups" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium">
                Groups
              </Link>
              <Link to="/settlements" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium">
                Settlements
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/add-expense"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusCircle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
              Add Expense
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Log out</span>
              <LogOut className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-gray-200 bg-white dark:bg-gray-800 fixed bottom-0 w-full flex justify-around p-2">
        <Link to="/" className="flex flex-col items-center text-gray-500 hover:text-primary">
          <PieChart className="h-6 w-6" />
          <span className="text-xs">Dash</span>
        </Link>
        <Link to="/groups" className="flex flex-col items-center text-gray-500 hover:text-primary">
          <Users className="h-6 w-6" />
          <span className="text-xs">Groups</span>
        </Link>
        <Link to="/settlements" className="flex flex-col items-center text-gray-500 hover:text-primary">
          <CreditCard className="h-6 w-6" />
          <span className="text-xs">Settlements</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
