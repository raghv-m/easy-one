import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle, Users, MapPin, Edit2, X } from 'lucide-react';
import axios from 'axios';

const POSPage = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showTableForm, setShowTableForm] = useState(false);
  const [manualTableNumber, setManualTableNumber] = useState('');
  const [cartItemInstructions, setCartItemInstructions] = useState({});
  const [tableGridRows, setTableGridRows] = useState(3);
  const [tableGridCols, setTableGridCols] = useState(4);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tablesRes, menusRes] = await Promise.all([
        axios.get(`${API_URL}/tables`, { headers }),
        axios.get(`${API_URL}/menus`, { headers }),
      ]);
      setTables(tablesRes.data.tables || []);
      setMenuItems(menusRes.data.items || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity } : c));
    }
  };

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) {
      setError('Please select a table and add items');
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/orders`, {
        tableId: selectedTable.id,
        tableNumber: selectedTable.tableNumber,
        guestName: guestName || 'Guest',
        guestCount: parseInt(guestCount) || selectedTable.seats,
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          category: item.category,
          quantity: item.quantity,
          specialInstructions: cartItemInstructions[item.id] || '',
        })),
        allergies: allergies,
        specialInstructions: specialInstructions,
      }, { headers });

      setSuccess('Order submitted successfully!');
      setCart([]);
      setSelectedTable(null);
      setSpecialInstructions('');
      setAllergies('');
      setGuestCount('');
      setGuestName('');
      setCartItemInstructions({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError(error.response?.data?.error || 'Failed to submit order');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading && tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">🍽️ POS / Order Entry</h1>
          </div>
          {selectedTable && (
            <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-lg border border-orange-500">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span className="text-orange-200 font-semibold">Table {selectedTable.tableNumber}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-200">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-200">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section - Tables & Menu */}
          <div className="lg:col-span-3 space-y-6">
            {/* Table Selection with Visual Layout */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-500" />
                  Restaurant Layout
                </h2>
                <button
                  onClick={() => setShowTableForm(!showTableForm)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Manual Entry
                </button>
              </div>

              {/* Manual Table Entry */}
              {showTableForm && (
                <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter table number (e.g., A1, 5, VIP-1)"
                      value={manualTableNumber}
                      onChange={(e) => setManualTableNumber(e.target.value)}
                      className="flex-1 bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-orange-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        if (manualTableNumber.trim()) {
                          setSelectedTable({
                            id: `manual-${manualTableNumber}`,
                            tableNumber: manualTableNumber,
                            seats: 4,
                          });
                          setManualTableNumber('');
                          setShowTableForm(false);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Select
                    </button>
                  </div>
                </div>
              )}

              {/* Table Grid Layout */}
              <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-300 block mb-1">Rows:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tableGridRows}
                      onChange={(e) => setTableGridRows(parseInt(e.target.value) || 1)}
                      className="w-16 bg-slate-600 text-white px-2 py-1 rounded border border-slate-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-1">Columns:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tableGridCols}
                      onChange={(e) => setTableGridCols(parseInt(e.target.value) || 1)}
                      className="w-16 bg-slate-600 text-white px-2 py-1 rounded border border-slate-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Table Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tableGridCols}, 1fr)`, gap: '12px' }}>
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-lg border-2 transition transform hover:scale-105 ${
                      selectedTable?.id === table.id
                        ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/50'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-bold text-white text-lg">Table {table.tableNumber}</p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-gray-300">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{table.seats} seats</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">📋 Menu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-orange-500 transition">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                    {item.category && (
                      <p className="text-xs text-orange-400 mt-2">{item.category}</p>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-green-400">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">📝 Order</h2>

              {selectedTable && (
                <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500 rounded-lg">
                  <p className="text-sm text-orange-200">
                    <span className="font-semibold">Table:</span> {selectedTable.tableNumber}
                  </p>
                </div>
              )}

              {/* Guest Info */}
              {selectedTable && (
                <div className="mb-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Guest Count"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none text-sm"
                  />
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-600 rounded px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-yellow-400 hover:text-yellow-300 font-bold"
                          >
                            −
                          </button>
                          <span className="text-white text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-green-400 hover:text-green-300 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const current = cartItemInstructions[item.id] || '';
                        const newInstructions = prompt('Add special instructions for this item:', current);
                        if (newInstructions !== null) {
                          setCartItemInstructions({
                            ...cartItemInstructions,
                            [item.id]: newInstructions,
                          });
                        }
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {cartItemInstructions[item.id] ? '✏️ Edit Notes' : '+ Add Notes'}
                    </button>
                    {cartItemInstructions[item.id] && (
                      <p className="text-xs text-blue-300 mt-1 italic">"{cartItemInstructions[item.id]}"</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Allergies & Special Instructions */}
              {cart.length > 0 && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <button
                    onClick={() => setShowSpecialInstructions(!showSpecialInstructions)}
                    className="w-full text-left text-sm font-semibold text-red-400 hover:text-red-300"
                  >
                    ⚠️ Allergies & Special Instructions
                  </button>
                  {showSpecialInstructions && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        placeholder="e.g., Gluten allergy, No nuts, Dairy-free..."
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full bg-slate-700 text-white px-2 py-2 rounded text-xs border border-slate-600 focus:border-red-500 outline-none"
                        rows="2"
                      />
                      <textarea
                        placeholder="e.g., Extra sauce, No onions, Well done..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full bg-slate-700 text-white px-2 py-2 rounded text-xs border border-slate-600 focus:border-orange-500 outline-none"
                        rows="2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-slate-600 pt-3 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-green-400">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitOrder}
                disabled={!selectedTable || cart.length === 0 || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? 'Submitting...' : '✓ Submit Order'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default POSPage;

