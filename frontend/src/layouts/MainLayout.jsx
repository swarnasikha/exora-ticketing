import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, LogOut, MessageSquare } from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-brand-600">ExoraDesk</h1>
          <p className="text-sm text-gray-500 mt-1">Hello, {user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/tickets" className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            <Ticket className="w-5 h-5" />
            <span>Tickets</span>
          </Link>
          <Link to="/ai-chat" className="flex items-center space-x-3 px-3 py-2 rounded-md text-brand-600 bg-brand-50 font-medium">
            <MessageSquare className="w-5 h-5" />
            <span>AI Assistant</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-3 py-2 w-full text-left text-gray-700 hover:text-red-600 transition-colors rounded-md hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Workspace</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">{user?.role}</span>
          </div>
        </header>
        <main className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
