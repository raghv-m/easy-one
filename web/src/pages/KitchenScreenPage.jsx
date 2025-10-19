import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const KitchenScreenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/kitchen/screen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders);
      setError('');
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCooking = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/start-cooking`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchKitchenOrders();
    } catch (err) {
      console.error('Error starting cooking:', err);
      alert(err.response?.data?.error || 'Failed to start cooking');
    }
  };

  const handleBumpToExpo = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/bump`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchKitchenOrders();
    } catch (err) {
      console.error('Error bumping to expo:', err);
      alert(err.response?.data?.error || 'Failed to bump to expo');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cooking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bumped':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cooking':
        return <Flame className="w-4 h-4" />;
      case 'bumped':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-white">Kitchen Screen</h1>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Active Orders</p>
            <p className="text-3xl font-bold text-white">{orders.length}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No active orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 hover:border-orange-500 transition cursor-pointer"
                onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                  <div>
                    <p className="text-gray-400 text-sm">Table</p>
                    <p className="text-2xl font-bold text-white">{order.tableId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Order Time</p>
                    <p className="text-sm text-gray-300">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="bg-gray-700 rounded p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{item.name}</p>
                          {item.notes && (
                            <p className="text-gray-300 text-sm mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </div>

                      {/* Cooking Timer */}
                      {item.status === 'cooking' && item.cookingStartedAt && (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {Math.floor(
                              (new Date() - new Date(item.cookingStartedAt)) / 1000 / 60
                            )}{' '}
                            min
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        {item.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartCooking(order.id, item.id);
                            }}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold py-2 rounded transition"
                          >
                            Start Cooking
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBumpToExpo(order.id, item.id);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded transition"
                          >
                            Bump to Expo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenScreenPage;

