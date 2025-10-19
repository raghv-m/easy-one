import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';

const KitchenPage = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/orders?status=active`, { headers });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_URL}/orders/${orderId}`, { status }, { headers });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const categories = ['All', 'Grill', 'Pasta', 'Appetizers', 'Salads', 'Drinks/Bar'];

  const filteredOrders = selectedCategory === 'All'
    ? orders
    : orders.filter(order => order.itemsByCategory?.[selectedCategory]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Kitchen View</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className={`rounded-lg shadow-lg p-6 ${
                order.status === 'pending'
                  ? 'bg-red-50 border-2 border-red-300'
                  : order.status === 'in_progress'
                  ? 'bg-yellow-50 border-2 border-yellow-300'
                  : 'bg-green-50 border-2 border-green-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Table {order.tableId}</h3>
                  <p className="text-sm text-gray-600">Order ID: {order.orderId?.slice(0, 8)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending'
                    ? 'bg-red-200 text-red-800'
                    : order.status === 'in_progress'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-green-200 text-green-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="mb-4 space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-600">Qty: {item.quantity || 1}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'in_progress')}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition"
                  >
                    <Clock className="w-4 h-4" />
                    Cook
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Bump
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'in_progress')}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recall
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No orders to display</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenPage;

