import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, AlertCircle, CheckCircle, Flame, BookOpen, X, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const StationScreenPage = () => {
  const { station } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRecipe, setShowRecipe] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const token = useAuthStore((state) => state.token);

  const stations = ['Grill', 'Fryer', 'Prep', 'Sauté', 'Pastry', 'Plating', 'Final'];
  const stationColors = {
    'Grill': 'from-red-600 to-red-700',
    'Fryer': 'from-orange-600 to-orange-700',
    'Prep': 'from-green-600 to-green-700',
    'Sauté': 'from-yellow-600 to-yellow-700',
    'Pastry': 'from-pink-600 to-pink-700',
    'Plating': 'from-purple-600 to-purple-700',
    'Final': 'from-blue-600 to-blue-700',
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchStationOrders, 3000);
    return () => clearInterval(interval);
  }, [station]);

  const fetchData = async () => {
    try {
      const [ordersRes, menusRes] = await Promise.all([
        axios.get(`${API_URL}/orders/station/${station}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/menus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const orders = (ordersRes.data.orders || []).sort((a, b) => {
        const timeA = a.createdAt?._seconds || new Date(a.createdAt).getTime() / 1000;
        const timeB = b.createdAt?._seconds || new Date(b.createdAt).getTime() / 1000;
        return timeA - timeB;
      });
      setOrders(orders);

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

  const fetchStationOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/station/${station}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching station orders:', err);
    }
  };

  const handleStartCooking = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/start-cooking`,
        { station },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStationOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start cooking');
    }
  };

  const handleFireItem = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/fire`,
        { station },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStationOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to fire item');
    }
  };

  const handleBumpToNext = async (orderId, itemId) => {
    try {
      const nextStation = station === 'Final' ? 'Expo' : 'Final';
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/bump`,
        { station, nextStation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStationOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to bump item');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cooking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'fired':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'bumped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeElapsed = (createdAt) => {
    if (!createdAt) return '0m';
    const now = new Date();
    const created = new Date(createdAt._seconds * 1000 || createdAt);
    const diff = Math.floor((now - created) / 60000);
    return `${diff}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {station} station...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${stationColors[station]} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/kitchen')}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <Flame className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-4xl font-bold text-white">{station} Station</h1>
                <p className="text-white/80 text-sm">Active Orders: {orders.length}</p>
              </div>
            </div>
          </div>
          <div className="text-right text-white">
            <p className="text-sm opacity-80">Station Screen</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No orders for {station} station</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur border-2 border-white/20 rounded-lg p-4 hover:border-white/40 transition cursor-pointer"
                onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                  <div>
                    <p className="text-white/70 text-sm">Table</p>
                    <p className="text-2xl font-bold text-white">{order.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">Time</p>
                    <p className="text-xl font-bold text-white">{getTimeElapsed(order.createdAt)}</p>
                  </div>
                </div>

                {/* Items for this station */}
                <div className="space-y-3">
                  {order.items?.map((item, idx) => {
                    const menuItem = menuItems[item.name];
                    const stationComponents = menuItem?.components?.filter(c => c.station === station) || [];
                    
                    if (stationComponents.length === 0) return null;

                    return (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-xs text-white/60">Qty: {item.quantity}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                            {item.status || 'pending'}
                          </span>
                        </div>

                        {/* Station Steps */}
                        <div className="mb-3 space-y-1">
                          {stationComponents.map((comp, cidx) => (
                            <p key={cidx} className="text-xs text-white/70">
                              • {comp.step} ({comp.duration}m)
                            </p>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {item.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartCooking(order.id, item.id);
                              }}
                              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-xs font-semibold transition"
                            >
                              Start
                            </button>
                          )}
                          {item.status === 'cooking' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFireItem(order.id, item.id);
                              }}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                            >
                              <Flame className="w-3 h-3" /> Fire
                            </button>
                          )}
                          {item.status === 'fired' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBumpToNext(order.id, item.id);
                              }}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" /> {station === 'Final' ? 'To Expo' : 'To Final'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-100">
                    <p className="font-semibold mb-1">Special Instructions:</p>
                    <p>{order.specialInstructions}</p>
                  </div>
                )}

                {/* Allergies */}
                {order.allergies && (
                  <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-100">
                    <p className="font-semibold mb-1">⚠️ Allergies:</p>
                    <p>{order.allergies}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationScreenPage;

