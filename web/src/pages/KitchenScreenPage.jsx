import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, AlertCircle, CheckCircle, Flame, BookOpen, X, Users, AlertTriangle, Grid3x3, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const KitchenScreenPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRecipe, setShowRecipe] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const token = useAuthStore((state) => state.token);

  const stations = ['Grill', 'Fryer', 'Prep', 'Sauté', 'Pastry', 'Plating', 'Final'];
  const stationColors = {
    'Grill': 'bg-red-600 hover:bg-red-700',
    'Fryer': 'bg-orange-600 hover:bg-orange-700',
    'Prep': 'bg-green-600 hover:bg-green-700',
    'Sauté': 'bg-yellow-600 hover:bg-yellow-700',
    'Pastry': 'bg-pink-600 hover:bg-pink-700',
    'Plating': 'bg-purple-600 hover:bg-purple-700',
    'Final': 'bg-blue-600 hover:bg-blue-700',
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchKitchenOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, menusRes] = await Promise.all([
        axios.get(`${API_URL}/orders/kitchen/screen`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/menus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setOrders(ordersRes.data.orders);

      // Create menu items map for quick lookup
      const itemsMap = {};
      (menusRes.data.menus || menusRes.data.items || []).forEach(item => {
        itemsMap[item.name] = item;
      });
      setMenuItems(itemsMap);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRecallItem = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/recall`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchKitchenOrders();
    } catch (err) {
      console.error('Error recalling item:', err);
      alert(err.response?.data?.error || 'Failed to recall item');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-300 border-l-4 border-l-red-600';
      case 'cooking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 border-l-4 border-l-yellow-600';
      case 'bumped':
        return 'bg-green-100 text-green-800 border-green-300 border-l-4 border-l-green-600';
      case 'done':
        return 'bg-blue-100 text-blue-800 border-blue-300 border-l-4 border-l-blue-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 border-l-4 border-l-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-50';
      case 'cooking':
        return 'bg-yellow-50';
      case 'bumped':
        return 'bg-green-50';
      case 'done':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
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
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Recipe Modal Component
  const RecipeModal = ({ itemName, onClose }) => {
    const item = menuItems[itemName];
    if (!item) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-500">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Prep Time</p>
                <p className="text-2xl font-bold text-white">{item.prepTime || 0} min</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Cook Time</p>
                <p className="text-2xl font-bold text-white">{item.cookTime || 0} min</p>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <p className="text-white">{item.description}</p>
              </div>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-red-200 font-semibold">Allergens</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen, idx) => (
                    <span key={idx} className="bg-red-700 text-red-100 px-3 py-1 rounded-full text-sm">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cooking Steps */}
            {item.components && item.components.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Cooking Steps</h3>
                <div className="space-y-3">
                  {item.components.map((step, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold">Step {idx + 1}: {step.step}</p>
                          <p className="text-gray-300 text-sm mt-1">{step.step}</p>
                        </div>
                        <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-semibold whitespace-nowrap ml-2">
                          {step.station}
                        </span>
                      </div>
                      {step.duration && (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{step.duration} min</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Time */}
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <p className="text-green-200 text-sm mb-1">Total Cooking Time</p>
              <p className="text-3xl font-bold text-green-400">
                {(item.prepTime || 0) + (item.cookTime || 0)} minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading kitchen orders...</p>
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

        {/* Station Navigation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Grid3x3 className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-white">Station Screens</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {stations.map((station) => (
              <button
                key={station}
                onClick={() => navigate(`/kitchen/station/${station}`)}
                className={`py-2 px-3 rounded-lg font-semibold text-white transition transform hover:scale-105 active:scale-95 ${stationColors[station]}`}
              >
                {station}
              </button>
            ))}
            <button
              onClick={() => navigate('/expo')}
              className="py-2 px-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition transform hover:scale-105 active:scale-95"
            >
              Expo
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Scroll Controls */}
        {orders.length > 0 && (
          <div className="mb-4 flex gap-2 justify-center">
            <button
              onClick={() => {
                const container = document.getElementById('orders-container');
                if (container) container.scrollLeft -= 300;
              }}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              title="Scroll Left"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const container = document.getElementById('orders-container');
                if (container) container.scrollLeft += 300;
              }}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              title="Scroll Right"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No active orders</p>
          </div>
        ) : (
          <div id="orders-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-4">
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

                {/* Guest Info */}
                {order.guestName && (
                  <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
                    <div className="flex items-center gap-2 text-blue-200">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{order.guestName}</strong> ({order.guestCount} guests)
                      </span>
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {order.allergies && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-200 text-xs font-semibold">Allergies</p>
                        <p className="text-red-100 text-sm">{order.allergies}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                    <p className="text-yellow-200 text-xs font-semibold mb-1">Special Instructions</p>
                    <p className="text-yellow-100 text-sm">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className={`rounded p-3 border-2 ${getStatusBgColor(item.status)} ${getStatusColor(item.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{item.name}</p>
                          <p className="text-gray-300 text-xs">Qty: {item.quantity}</p>
                          {item.specialInstructions && (
                            <p className="text-blue-300 text-xs mt-1">📝 {item.specialInstructions}</p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Cooking Timer */}
                      {item.status === 'cooking' && item.cookingStartedAt && (
                        <div className="flex items-center gap-2 text-yellow-600 text-sm mb-2 font-semibold">
                          <Clock className="w-4 h-4" />
                          <span>
                            {Math.floor(
                              (new Date() - new Date(item.cookingStartedAt)) / 1000 / 60
                            )}{' '}
                            min cooking
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRecipe(item.name);
                          }}
                          className="flex-1 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded transition flex items-center justify-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          Recipe
                        </button>
                        {item.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartCooking(order.id, item.id);
                            }}
                            className="flex-1 min-w-[80px] bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold py-2 rounded transition"
                          >
                            🔥 Cook
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBumpToExpo(order.id, item.id);
                              }}
                              className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded transition"
                            >
                              ✓ Fire
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecallItem(order.id, item.id);
                              }}
                              className="flex-1 min-w-[80px] bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Recall
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe Modal */}
        {showRecipe && <RecipeModal itemName={showRecipe} onClose={() => setShowRecipe(null)} />}
      </div>
    </div>
  );
};

export default KitchenScreenPage;

