import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, AlertCircle, CheckCircle, Flame, BookOpen, X, Users, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const KitchenScreenPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStation, setSelectedStation] = useState('All');
  const [showRecipe, setShowRecipe] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const token = useAuthStore((state) => state.token);

  const stations = ['All', 'Grill', 'Fryer', 'Prep', 'Sauté', 'Pastry', 'Plating', 'Final', 'Expo'];
  const stationColors = {
    'All': 'bg-gray-700 hover:bg-gray-800',
    'Grill': 'bg-red-600 hover:bg-red-700',
    'Fryer': 'bg-orange-600 hover:bg-orange-700',
    'Prep': 'bg-green-600 hover:bg-green-700',
    'Sauté': 'bg-yellow-600 hover:bg-yellow-700',
    'Pastry': 'bg-pink-600 hover:bg-pink-700',
    'Plating': 'bg-purple-600 hover:bg-purple-700',
    'Final': 'bg-blue-600 hover:bg-blue-700',
    'Expo': 'bg-emerald-600 hover:bg-emerald-700',
  };

  useEffect(() => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    fetchData();
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, [token]);

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
      setOrders(ordersRes.data.orders || []);
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
      const newOrders = response.data.orders || [];
      if (newOrders.length > orders.length) {
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 3000);
      }
      setOrders(newOrders);
      setError('');
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    }
  };

  // Filter orders by station - check if any item in the order has this station in its components
  const filteredOrders = selectedStation === 'All'
    ? orders
    : orders.filter(order =>
        order.items?.some(item => {
          // Get the menu item to check its components
          const menuItem = menuItems[item.name];
          if (!menuItem) return false;

          // Check if this item has a component for the selected station
          return menuItem.components?.some(comp => comp.station === selectedStation);
        })
      );

  const handleStartCooking = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/start-cooking`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchKitchenOrders();
    } catch (err) {
      console.error('Error starting cooking:', err);
      alert(err.response?.data?.error || 'Failed to start cooking');
    }
  };

  const handleBumpToExpo = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/fire`,
        { station: 'Kitchen' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchKitchenOrders();
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
      await fetchKitchenOrders();
    } catch (err) {
      console.error('Error recalling item:', err);
      alert(err.response?.data?.error || 'Failed to recall item');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-600 text-white';
      case 'cooking':
        return 'bg-yellow-600 text-white';
      case 'bumped':
      case 'ready':
        return 'bg-green-600 text-white';
      case 'done':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-6 h-6" />;
      case 'cooking':
        return <Flame className="w-6 h-6" />;
      case 'bumped':
      case 'ready':
        return <CheckCircle className="w-6 h-6" />;
      case 'done':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <ChefHat className="w-20 h-20 text-orange-500 mx-auto mb-4 animate-bounce" />
          <p className="text-white text-3xl font-bold">Loading Kitchen Screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header - Large, High Contrast */}
      <header className="bg-gray-950 border-b-4 border-orange-600 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <ChefHat className="w-12 h-12 text-orange-500" />
              <div>
                <h1 className="text-5xl font-bold text-white">KITCHEN SCREEN</h1>
                <p className="text-2xl text-gray-400 mt-2">Active Orders: <span className="text-orange-400 font-bold text-3xl">{filteredOrders.length}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-xl font-bold"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-full px-8 py-8">
        {/* New Order Alert */}
        {newOrderAlert && (
          <div className="mb-8 p-6 bg-green-900 border-4 border-green-400 rounded-lg animate-pulse">
            <p className="text-green-200 text-3xl font-bold">🔔 NEW ORDER RECEIVED!</p>
          </div>
        )}

        {/* Station Filter Buttons - Large, Touch-Friendly */}
        <div className="mb-8 flex gap-4 overflow-x-auto pb-4 flex-wrap">
          {stations.map(station => (
            <button
              key={station}
              onClick={() => setSelectedStation(station)}
              className={`px-8 py-4 rounded-lg font-bold transition whitespace-nowrap text-xl ${
                selectedStation === station
                  ? `${stationColors[station]} ring-4 ring-white scale-110`
                  : `${stationColors[station]} opacity-70 hover:opacity-100`
              }`}
              aria-label={`Filter by ${station} station`}
            >
              {station}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-900 border-4 border-red-500 rounded-lg flex items-start gap-4">
            <AlertCircle className="w-10 h-10 text-red-300 flex-shrink-0 mt-1" />
            <p className="text-red-100 text-2xl font-semibold">{error}</p>
          </div>
        )}

        {/* Orders Grid - Large Cards */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 text-3xl font-bold">No active orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 border-4 border-gray-700 rounded-lg p-6 hover:border-orange-500 transition cursor-pointer shadow-lg"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-700">
                  <div>
                    <p className="text-gray-400 text-lg">TABLE</p>
                    <p className="text-5xl font-bold text-white">{order.tableId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-lg">Order Time</p>
                    <p className="text-2xl text-gray-300 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Guest Info */}
                {order.guestName && (
                  <div className="mb-6 p-4 bg-blue-900/40 border-2 border-blue-600 rounded-lg">
                    <div className="flex items-center gap-3 text-blue-200">
                      <Users className="w-6 h-6" />
                      <span className="text-xl font-semibold">
                        <strong>{order.guestName}</strong> ({order.guestCount} guests)
                      </span>
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {order.allergies && (
                  <div className="mb-6 p-4 bg-red-900/40 border-2 border-red-600 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-red-200 text-lg font-bold">⚠️ ALLERGIES</p>
                        <p className="text-red-100 text-xl mt-2">{order.allergies}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-4">
                  {order.items?.filter(item => {
                    // If viewing all stations, show all items
                    if (selectedStation === 'All') return true;

                    // Otherwise, only show items that have this station in their components
                    const menuItem = menuItems[item.name];
                    if (!menuItem) return false;
                    return menuItem.components?.some(comp => comp.station === selectedStation);
                  }).map((item, idx) => (
                    <div key={idx} className={`rounded-lg p-4 border-4 ${getStatusColor(item.status || 'pending')}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-2xl font-bold">{item.name}</p>
                          <p className="text-lg mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(item.status || 'pending')}
                          <span className="text-lg font-bold">{(item.status || 'pending').toUpperCase()}</span>
                        </div>
                      </div>

                      {item.specialInstructions && (
                        <p className="text-lg bg-black/30 p-2 rounded mb-3">📝 {item.specialInstructions}</p>
                      )}

                      {/* Action Buttons - Large, Touch-Friendly */}
                      <div className="flex gap-3 mt-4 flex-wrap">
                        <button
                          onClick={() => setShowRecipe(item.name)}
                          className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-6 h-6" />
                          Recipe
                        </button>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleStartCooking(order.id, item.id)}
                            className="flex-1 min-w-[120px] bg-yellow-600 hover:bg-yellow-700 text-white text-lg font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <Flame className="w-6 h-6" />
                            FIRE
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <>
                            <button
                              onClick={() => handleBumpToExpo(order.id, item.id)}
                              className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <ArrowRight className="w-6 h-6" />
                              BUMP
                            </button>
                            <button
                              onClick={() => handleRecallItem(order.id, item.id)}
                              className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 rounded-lg transition"
                            >
                              RECALL
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
      </main>

      {/* Recipe Modal */}
      {showRecipe && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-8 border-4 border-orange-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-white">{showRecipe}</h2>
              <button
                onClick={() => setShowRecipe(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="text-gray-300 text-xl">
              {menuItems[showRecipe]?.recipe ? (
                <p className="whitespace-pre-wrap">{menuItems[showRecipe].recipe}</p>
              ) : (
                <p>No recipe available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenScreenPage;

