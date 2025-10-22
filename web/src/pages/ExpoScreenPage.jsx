import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle, AlertCircle, Clock, BookOpen, ChevronUp, ChevronDown, RotateCcw, Flame } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ExpoScreenPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRecipe, setShowRecipe] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchExpoItems, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, menusRes] = await Promise.all([
        axios.get(`${API_URL}/orders/expo/screen`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/menus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setItems(itemsRes.data.items);

      // Create menu items map for quick lookup
      const itemsMap = {};
      (menusRes.data.menus || menusRes.data.items || []).forEach(item => {
        itemsMap[item.name] = item;
      });
      setMenuItems(itemsMap);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRecallItem = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/recall`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExpoItems();
    } catch (err) {
      console.error('Error recalling item:', err);
      alert(err.response?.data?.error || 'Failed to recall item');
    }
  };

  const getItemStatus = (item) => {
    // Determine if item is cooking, done, or ready
    if (item.status === 'bumped' || item.status === 'ready') {
      return 'ready';
    }
    return item.status || 'ready';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'cooking':
        return 'border-l-4 border-l-yellow-600 bg-yellow-50';
      case 'ready':
        return 'border-l-4 border-l-green-600 bg-green-50';
      case 'done':
        return 'border-l-4 border-l-blue-600 bg-blue-50';
      default:
        return 'border-l-4 border-l-gray-600 bg-gray-50';
    }
  };

  // Recipe Modal Component
  const RecipeModal = ({ itemName, onClose }) => {
    const item = menuItems[itemName];
    if (!item) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-green-500">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <AlertCircle className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {item.description && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <p className="text-white">{item.description}</p>
              </div>
            )}

            {item.components && item.components.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Cooking Steps</h3>
                <div className="space-y-2">
                  {item.components.map((step, idx) => (
                    <div key={idx} className="bg-gray-700 rounded p-3 border-l-4 border-green-500">
                      <p className="text-white font-semibold">Step {idx + 1}: {step.step}</p>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {step.station}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Utensils className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold text-white">Expo Screen</h1>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm">Ready Items</p>
            <p className="text-3xl font-bold text-green-400">{items.length}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No items ready for pickup</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const status = getItemStatus(item);
              return (
                <div
                  key={item.id}
                  className={`bg-gray-800 rounded-lg shadow-lg p-6 ${getStatusColor(status)} hover:shadow-xl transition border-2 border-gray-700`}
                >
                  {/* Item Header */}
                  <div className="mb-4 pb-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-300 text-sm font-semibold">TABLE</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        status === 'ready' ? 'bg-green-600 text-white' :
                        status === 'cooking' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {status === 'ready' && <CheckCircle className="w-4 h-4" />}
                        {status === 'cooking' && <Flame className="w-4 h-4" />}
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-4xl font-bold text-white">{item.orderId?.slice(-2)}</p>
                  </div>

                  {/* Item Details */}
                  <div className="bg-gray-700 rounded p-4 mb-4">
                    <p className="text-gray-300 text-sm mb-1">Item</p>
                    <p className="text-lg font-semibold text-white">{item.item?.name}</p>
                    {item.item?.notes && (
                      <p className="text-gray-300 text-sm mt-2">📝 {item.item.notes}</p>
                    )}
                  </div>

                  {/* Time Ready */}
                  <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    <span>
                      Ready at {new Date(item.bumpedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRecipe(item.item?.name)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <BookOpen className="w-4 h-4" />
                      Recipe
                    </button>
                    <button
                      onClick={() => handleServeOrder(item.orderId)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      ✓ Serve
                    </button>
                    {status === 'cooking' && (
                      <button
                        onClick={() => handleRecallItem(item.orderId, item.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Recall
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recipe Modal */}
        {showRecipe && <RecipeModal itemName={showRecipe} onClose={() => setShowRecipe(null)} />}
      </div>
    </div>
  );
};

export default ExpoScreenPage;

