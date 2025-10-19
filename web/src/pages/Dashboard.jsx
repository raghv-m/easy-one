import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, ShoppingCart, ChefHat, Users, Calendar, Settings, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'pos', label: 'POS / Orders', icon: ShoppingCart, color: 'bg-blue-500', roles: ['Front Staff', 'Manager'] },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat, color: 'bg-orange-500', roles: ['Kitchen Staff', 'Manager'] },
    { id: 'expo', label: 'Expo', icon: Users, color: 'bg-green-500', roles: ['Expo Staff', 'Manager'] },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'bg-purple-500', roles: ['Front Staff', 'Kitchen Staff', 'Expo Staff', 'Manager'] },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'bg-red-500', roles: ['Manager'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-indigo-500', roles: ['Manager'] },
  ];

  const availableItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Manager</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Role</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{user?.role}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Organization</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">ID: {user?.orgId?.slice(0, 8)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Email</h3>
            <p className="text-lg font-semibold text-gray-900 mt-2 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition transform hover:scale-105 p-6 text-left"
              >
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  {item.id === 'pos' && 'Create and manage orders'}
                  {item.id === 'kitchen' && 'View and prepare orders'}
                  {item.id === 'expo' && 'Finalize and serve orders'}
                  {item.id === 'schedule' && 'Manage your shifts'}
                  {item.id === 'admin' && 'Configure restaurant settings'}
                  {item.id === 'analytics' && 'View business metrics'}
                </p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

