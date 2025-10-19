import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ExpoScreenPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchExpoItems();
    const interval = setInterval(fetchExpoItems, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchExpoItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/expo/screen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data.items);
      setError('');
    } catch (err) {
      console.error('Error fetching expo items:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleServeOrder = async (orderId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/serve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExpoItems();
    } catch (err) {
      console.error('Error serving order:', err);
      alert(err.response?.data?.error || 'Failed to serve order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expo items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Utensils className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Expo Screen</h1>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Ready Items</p>
            <p className="text-3xl font-bold text-green-600">{items.length}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No items ready for pickup</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition"
              >
                {/* Item Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 text-sm font-semibold">TABLE</p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Ready
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-gray-800">{item.orderId?.slice(-2)}</p>
                </div>

                {/* Item Details */}
                <div className="bg-gray-50 rounded p-4 mb-4">
                  <p className="text-gray-600 text-sm mb-1">Item</p>
                  <p className="text-lg font-semibold text-gray-800">{item.item?.name}</p>
                  {item.item?.notes && (
                    <p className="text-gray-600 text-sm mt-2">Note: {item.item.notes}</p>
                  )}
                </div>

                {/* Time Ready */}
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  <span>
                    Ready at {new Date(item.bumpedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Serve Button */}
                <button
                  onClick={() => handleServeOrder(item.orderId)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                >
                  Serve Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpoScreenPage;

