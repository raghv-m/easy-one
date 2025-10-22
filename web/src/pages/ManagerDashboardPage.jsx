import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Save, AlertCircle, CheckCircle, Users, UtensilsCrossed, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ManagerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('tables');
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'tables') {
        const res = await axios.get(`${API_URL}/tables`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTables(res.data.tables || []);
      } else if (activeTab === 'orders') {
        const res = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders || []);
      } else if (activeTab === 'employees') {
        const res = await axios.get(`${API_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data.employees || []);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'tables') {
        await axios.put(`${API_URL}/tables/${editingId}`, editData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (activeTab === 'orders') {
        await axios.put(`${API_URL}/orders/${editingId}`, editData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (activeTab === 'employees') {
        await axios.put(`${API_URL}/employees/${editingId}`, editData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (activeTab === 'tables') {
        await axios.delete(`${API_URL}/tables/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (activeTab === 'orders') {
        await axios.delete(`${API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (activeTab === 'employees') {
        await axios.delete(`${API_URL}/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
          <p className="text-gray-400">Manage tables, orders, and employees</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'tables'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <UtensilsCrossed className="inline mr-2 w-5 h-5" />
            Tables
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <DollarSign className="inline mr-2 w-5 h-5" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'employees'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Users className="inline mr-2 w-5 h-5" />
            Employees
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">Tables ({tables.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map(table => (
                    <div key={table.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      {editingId === table.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Table Number"
                            value={editData.tableNumber || ''}
                            onChange={(e) => setEditData({ ...editData, tableNumber: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          />
                          <input
                            type="number"
                            placeholder="Seats"
                            value={editData.seats || ''}
                            onChange={(e) => setEditData({ ...editData, seats: parseInt(e.target.value) })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          />
                          <select
                            value={editData.status || 'available'}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" /> Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-white">Table {table.tableNumber}</h3>
                              <p className="text-sm text-gray-400">{table.seats} seats • {table.type}</p>
                            </div>
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${
                              table.status === 'occupied'
                                ? 'bg-red-900 text-red-200'
                                : 'bg-green-900 text-green-200'
                            }`}>
                              {table.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(table)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(table.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">Orders ({orders.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="bg-gray-800 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">Table</th>
                        <th className="px-4 py-3 text-left">Guest</th>
                        <th className="px-4 py-3 text-left">Items</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="px-4 py-3 font-semibold">{order.tableNumber}</td>
                          <td className="px-4 py-3">{order.guestName}</td>
                          <td className="px-4 py-3">{order.items?.length || 0}</td>
                          <td className="px-4 py-3">${order.totalAmount?.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.status === 'active'
                                ? 'bg-yellow-900 text-yellow-200'
                                : 'bg-green-900 text-green-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">Employees ({employees.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map(emp => (
                    <div key={emp.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      {editingId === emp.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Name"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={editData.email || ''}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          />
                          <input
                            type="text"
                            placeholder="Phone"
                            value={editData.phone || ''}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          />
                          <select
                            value={editData.role || ''}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                          >
                            <option value="">Select Role</option>
                            <option value="Manager">Manager</option>
                            <option value="Server">Server</option>
                            <option value="Line Cook">Line Cook</option>
                            <option value="Expo">Expo</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" /> Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-white">{emp.name}</h3>
                            <p className="text-sm text-gray-400">{emp.role}</p>
                            <p className="text-xs text-gray-500">{emp.email}</p>
                            <p className="text-xs text-gray-500">{emp.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboardPage;

