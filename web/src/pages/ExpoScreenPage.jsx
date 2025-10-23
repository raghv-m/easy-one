import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle, AlertCircle, Clock, BookOpen, X, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ExpoScreenPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRecipe, setShowRecipe] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [newItemAlert, setNewItemAlert] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    fetchData();
    const interval = setInterval(fetchExpoItems, 3000);
    return () => clearInterval(interval);
  }, [token]);

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
      setItems(itemsRes.data.items || []);
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
      const newItems = response.data.items || [];
      if (newItems.length > items.length) {
        setNewItemAlert(true);
        setTimeout(() => setNewItemAlert(false), 3000);
      }
      setItems(newItems);
      setError('');
    } catch (err) {
      console.error('Error fetching expo items:', err);
    }
  };

  const handleServeOrder = async (orderId, itemId) => {
    try {
      await axios.post(
        `${API_URL}/orders/${orderId}/items/${itemId}/serve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchExpoItems();
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
      await fetchExpoItems();
    } catch (err) {
      console.error('Error recalling item:', err);
      alert(err.response?.data?.error || 'Failed to recall item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-900">
        <div className="text-center">
          <Utensils className="w-20 h-20 text-white mx-auto mb-4 animate-bounce" />
          <p className="text-white text-3xl font-bold">Loading Expo Screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-900 text-white">
      {/* Header - Large, High Contrast */}
      <header className="bg-green-950 border-b-4 border-green-400 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Utensils className="w-12 h-12 text-green-400" />
              <div>
                <h1 className="text-5xl font-bold text-white">EXPO SCREEN</h1>
                <p className="text-2xl text-green-300 mt-2">Ready Items: <span className="text-green-400 font-bold text-3xl">{items.length}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-green-700 hover:bg-green-600 rounded-lg transition text-xl font-bold"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-full px-8 py-8">
        {/* New Item Alert */}
        {newItemAlert && (
          <div className="mb-8 p-6 bg-green-700 border-4 border-green-300 rounded-lg animate-pulse">
            <p className="text-green-100 text-3xl font-bold">🔔 NEW ITEM READY!</p>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-900 border-4 border-red-500 rounded-lg flex items-start gap-4">
            <AlertCircle className="w-10 h-10 text-red-300 flex-shrink-0 mt-1" />
            <p className="text-red-100 text-2xl font-semibold">{error}</p>
          </div>
        )}

        {/* Items Grid - Large Cards */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Utensils className="w-24 h-24 text-green-700 mx-auto mb-6" />
            <p className="text-green-300 text-3xl font-bold">No items ready for serving</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-green-800 border-4 border-green-600 rounded-lg p-6 hover:border-green-300 transition cursor-pointer shadow-lg"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-green-600">
                  <div>
                    <p className="text-green-300 text-lg">TABLE</p>
                    <p className="text-5xl font-bold text-white">{item.tableId || item.table}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-300 text-lg">Status</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">READY</span>
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="mb-6 p-4 bg-green-700/40 border-2 border-green-600 rounded-lg">
                  <p className="text-3xl font-bold text-white mb-2">{item.name}</p>
                  <p className="text-xl text-green-200">Qty: {item.quantity || 1}</p>
                  {item.specialInstructions && (
                    <p className="text-lg text-green-100 mt-3 bg-black/30 p-2 rounded">
                      📝 {item.specialInstructions}
                    </p>
                  )}
                </div>

                {/* Ready Time */}
                <div className="mb-6 p-4 bg-green-700/40 border-2 border-green-600 rounded-lg flex items-center gap-3">
                  <Clock className="w-6 h-6 text-green-300" />
                  <div>
                    <p className="text-green-300 text-sm">Ready at</p>
                    <p className="text-2xl font-mono text-white">
                      {item.readyAt ? new Date(item.readyAt).toLocaleTimeString() : 'Now'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Large, Touch-Friendly */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setShowRecipe(item.name)}
                    className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-6 h-6" />
                    Recipe
                  </button>
                  <button
                    onClick={() => handleServeOrder(item.orderId, item.id)}
                    className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    SERVE
                  </button>
                  <button
                    onClick={() => handleRecallItem(item.orderId, item.id)}
                    className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-6 h-6" />
                    RECALL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Recipe Modal */}
      {showRecipe && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-8 border-4 border-green-400">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-white">{showRecipe}</h2>
              <button
                onClick={() => setShowRecipe(null)}
                className="p-2 hover:bg-green-700 rounded-lg transition"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="text-green-100 text-xl">
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

export default ExpoScreenPage;

