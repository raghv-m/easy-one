import React, { useState, useEffect } from 'react';
import { ChefHat, AlertCircle, CheckCircle, Flame, BookOpen, X, Users, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
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

  const handleRecallItem = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/recall`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStationOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to recall item');
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
    <div className={`min-h-screen bg-gradient-to-br ${stationColors[station]} p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header - Large, High Contrast */}
        <div className="flex items-center justify-between mb-8 bg-black/40 p-6 rounded-lg border-4 border-white/30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/kitchen')}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-xl font-bold"
            >
              ← Back
            </button>
            <div className="flex items-center gap-4">
              <Flame className="w-16 h-16 text-white" />
              <div>
                <h1 className="text-5xl font-bold text-white">{station.toUpperCase()} STATION</h1>
                <p className="text-white/90 text-2xl mt-2">Active Orders: <span className="font-bold text-3xl">{orders.length}</span></p>
              </div>
            </div>
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
          <div className="text-center py-20">
            <ChefHat className="w-24 h-24 text-white/30 mx-auto mb-6" />
            <p className="text-white/70 text-3xl font-bold">No orders for {station} station</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur border-4 border-white/30 rounded-lg p-6 hover:border-white/60 transition cursor-pointer shadow-2xl"
                onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-white/30">
                  <div>
                    <p className="text-white/70 text-lg">TABLE</p>
                    <p className="text-5xl font-bold text-white">{order.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-lg">TIME</p>
                    <p className="text-3xl font-bold text-white">{getTimeElapsed(order.createdAt)}</p>
                  </div>
                </div>

                {/* Items for this station */}
                <div className="space-y-4">
                  {order.items?.map((item, idx) => {
                    const menuItem = menuItems[item.name];
                    const stationComponents = menuItem?.components?.filter(c => c.station === station) || [];

                    if (stationComponents.length === 0) return null;

                    return (
                      <div key={idx} className="bg-white/10 rounded-lg p-4 border-2 border-white/20">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-bold text-white text-2xl">{item.name}</p>
                            <p className="text-lg text-white/70">Qty: {item.quantity}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-lg text-lg font-bold ${getStatusColor(item.status)}`}>
                            {(item.status || 'pending').toUpperCase()}
                          </span>
                        </div>

                        {/* Station Steps */}
                        <div className="mb-4 space-y-2 bg-black/30 p-3 rounded-lg">
                          {stationComponents.map((comp, cidx) => (
                            <p key={cidx} className="text-lg text-white/80">
                              <span className="font-bold">Step {cidx + 1}:</span> {comp.step} <span className="text-white/60">({comp.duration}m)</span>
                            </p>
                          ))}
                        </div>

                        {/* Action Buttons - Large, Touch-Friendly */}
                        <div className="flex gap-3 flex-wrap">
                          {item.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartCooking(order.id, item.id);
                              }}
                              className="flex-1 min-w-[120px] bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg text-lg font-bold transition"
                            >
                              START
                            </button>
                          )}
                          {item.status === 'cooking' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFireItem(order.id, item.id);
                                }}
                                className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg text-lg font-bold transition flex items-center justify-center gap-2"
                              >
                                <Flame className="w-6 h-6" /> FIRE
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRecallItem(order.id, item.id);
                                }}
                                className="flex-1 min-w-[120px] bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-lg font-bold transition flex items-center justify-center gap-2"
                              >
                                <RotateCcw className="w-6 h-6" /> RECALL
                              </button>
                            </>
                          )}
                          {item.status === 'fired' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBumpToNext(order.id, item.id);
                              }}
                              className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-lg font-bold transition flex items-center justify-center gap-2"
                            >
                              <ArrowRight className="w-6 h-6" /> {station === 'Final' ? 'TO EXPO' : 'TO FINAL'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mt-4 p-4 bg-yellow-500/30 border-2 border-yellow-400 rounded-lg text-lg text-yellow-100">
                    <p className="font-bold mb-2">📝 SPECIAL INSTRUCTIONS:</p>
                    <p className="text-xl">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Allergies */}
                {order.allergies && (
                  <div className="mt-4 p-4 bg-red-500/30 border-2 border-red-400 rounded-lg text-lg text-red-100">
                    <p className="font-bold mb-2">⚠️ ALLERGIES:</p>
                    <p className="text-xl">{order.allergies}</p>
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

