import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Users, UtensilsCrossed, Table2, Settings, X, Plus, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employees, setEmployees] = useState([]);
  const [tables, setTables] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingTable, setEditingTable] = useState(null);

  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    role: 'Kitchen Staff',
  });

  const [tableForm, setTableForm] = useState({
    tableNumber: '',
    seats: '',
    type: 'indoor',
    location: '',
  });

  const [menuItems, setMenuItems] = useState([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    prepTime: '',
    cookTime: '',
  });

  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'tables', label: 'Tables', icon: Table2 },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'tables') {
      fetchTables();
    } else if (activeTab === 'menu') {
      fetchMenuItems();
    }
  }, [activeTab]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.employees || []);
      setError('');
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(response.data.tables || []);
      setError('');
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data.menus || []);
      setError('');
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email || !employeeForm.phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/employees/add`, employeeForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Employee ${response.data.employeeNumber} added successfully! Invite sent to ${employeeForm.email}`);
      setEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        role: 'Kitchen Staff',
      });
      setShowEmployeeForm(false);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!tableForm.tableNumber || !tableForm.seats) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/tables`, tableForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Table added successfully!');
      setTableForm({
        tableNumber: '',
        seats: '',
        type: 'indoor',
        location: '',
      });
      setShowTableForm(false);
      fetchTables();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add table');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`${API_URL}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Employee deleted successfully');
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;

    try {
      await axios.delete(`${API_URL}/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Table deleted successfully');
      fetchTables();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete table');
    }
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price || !menuForm.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...menuForm,
        price: parseFloat(menuForm.price),
        prepTime: parseInt(menuForm.prepTime) || 0,
        cookTime: parseInt(menuForm.cookTime) || 0,
      };

      if (editingMenu) {
        await axios.put(`${API_URL}/menus/${editingMenu.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Menu item updated successfully!');
      } else {
        await axios.post(`${API_URL}/menus`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Menu item added successfully!');
      }

      setMenuForm({
        name: '',
        price: '',
        category: '',
        description: '',
        prepTime: '',
        cookTime: '',
      });
      setEditingMenu(null);
      setShowMenuForm(false);
      fetchMenuItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = (item) => {
    setEditingMenu(item);
    setMenuForm({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      prepTime: item.prepTime || '',
      cookTime: item.cookTime || '',
    });
    setShowMenuForm(true);
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await axios.delete(`${API_URL}/menus/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Menu item deleted successfully');
      fetchMenuItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete menu item');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Employees</h2>
                <button
                  onClick={() => setShowEmployeeForm(!showEmployeeForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Employee
                </button>
              </div>

              {/* Employee Form */}
              {showEmployeeForm && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          value={employeeForm.firstName}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={employeeForm.lastName}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={employeeForm.phoneNumber}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={employeeForm.address}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123 Main St, City, State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          value={employeeForm.emergencyContact}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyContact: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                        <input
                          type="tel"
                          value={employeeForm.emergencyPhone}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(555) 987-6543"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={employeeForm.role}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Kitchen Staff</option>
                          <option>Front Staff</option>
                          <option>Server</option>
                          <option>Manager</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                      >
                        {loading ? 'Adding...' : 'Add Employee & Send Invite'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmployeeForm(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Employees List */}
              {loading && !showEmployeeForm ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : employees.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No employees yet. Add your first employee to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee #</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{emp.employeeNumber || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{emp.name || `${emp.firstName} ${emp.lastName}`}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.phoneNumber || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.role}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {emp.status || 'active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TABLES TAB */}
          {activeTab === 'tables' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Tables</h2>
                <button
                  onClick={() => setShowTableForm(!showTableForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Table
                </button>
              </div>

              {/* Table Form */}
              {showTableForm && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <form onSubmit={handleAddTable} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                        <input
                          type="number"
                          value={tableForm.tableNumber}
                          onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seats *</label>
                        <input
                          type="number"
                          value={tableForm.seats}
                          onChange={(e) => setTableForm({ ...tableForm, seats: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="4"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={tableForm.type}
                          onChange={(e) => setTableForm({ ...tableForm, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>indoor</option>
                          <option>outdoor</option>
                          <option>bar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={tableForm.location}
                          onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Window, Corner, etc."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                      >
                        {loading ? 'Adding...' : 'Add Table'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTableForm(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tables List */}
              {loading && !showTableForm ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : tables.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No tables configured yet. Add your first table to get started.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <div key={table.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Table {table.tableNumber}</h3>
                          <p className="text-sm text-gray-600">{table.seats} seats • {table.type}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {table.location && <p className="text-sm text-gray-600 mb-2">📍 {table.location}</p>}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          table.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {table.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MENU TAB */}
          {activeTab === 'menu' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Menu Items</h2>
                <button
                  onClick={() => {
                    setShowMenuForm(!showMenuForm);
                    setEditingMenu(null);
                    setMenuForm({
                      name: '',
                      price: '',
                      category: '',
                      description: '',
                      prepTime: '',
                      cookTime: '',
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Menu Item
                </button>
              </div>

              {/* Menu Form */}
              {showMenuForm && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <form onSubmit={handleAddMenu} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                        <input
                          type="text"
                          value={menuForm.name}
                          onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Butter Chicken"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={menuForm.price}
                          onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <input
                          type="text"
                          value={menuForm.category}
                          onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Main Course"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={menuForm.description}
                          onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                        <input
                          type="number"
                          value={menuForm.prepTime}
                          onChange={(e) => setMenuForm({ ...menuForm, prepTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                        <input
                          type="number"
                          value={menuForm.cookTime}
                          onChange={(e) => setMenuForm({ ...menuForm, cookTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                      >
                        {loading ? 'Saving...' : editingMenu ? 'Update Item' : 'Add Item'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenuForm(false);
                          setEditingMenu(null);
                          setMenuForm({
                            name: '',
                            price: '',
                            category: '',
                            description: '',
                            prepTime: '',
                            cookTime: '',
                          });
                        }}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Menu Items Grid */}
              {loading && !showMenuForm ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : menuItems.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No menu items yet. Add your first item to get started.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">₹{item.price}</p>
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}

                      <div className="flex gap-2 text-xs text-gray-500 mb-4">
                        {item.prepTime > 0 && <span>⏱️ Prep: {item.prepTime}min</span>}
                        {item.cookTime > 0 && <span>🔥 Cook: {item.cookTime}min</span>}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMenu(item)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization ID</label>
                  <input
                    type="text"
                    value={user?.orgId || ''}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

