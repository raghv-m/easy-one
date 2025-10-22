import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Plus, Trash2, Edit2, AlertCircle, CheckCircle, ChefHat } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MenuItemsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [currentStation, setCurrentStation] = useState('Grill');

  const stations = ['Grill', 'Fryer', 'Prep', 'Sauté', 'Pastry', 'Plating', 'Expo'];

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    prepTime: '',
    cookTime: '',
    notifyEmployees: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data.menus || []);
      setError('');
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    if (!currentStep.trim()) {
      setError('Please enter a cooking step');
      return;
    }
    setSteps([...steps, { step: currentStep, station: currentStation }]);
    setCurrentStep('');
    setError('');
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || steps.length === 0) {
      setError('Please fill in all required fields and add at least one cooking step');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        components: steps,
      };

      if (editingItem) {
        await axios.put(`${API_URL}/menus/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Menu item updated successfully!');
      } else {
        await axios.post(`${API_URL}/menus`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Menu item added successfully! Employees notified.');
      }

      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        prepTime: '',
        cookTime: '',
        notifyEmployees: true,
      });
      setSteps([]);
      setShowForm(false);
      setEditingItem(null);
      fetchMenuItems();
    } catch (err) {
      console.error('Error saving menu item:', err);
      setError(err.response?.data?.error || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/menus/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Menu item deleted successfully!');
      fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      prepTime: item.prepTime || '',
      cookTime: item.cookTime || '',
      notifyEmployees: true,
    });
    setSteps(item.components || []);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-white">Menu Items</h1>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              setFormData({
                name: '',
                price: '',
                category: '',
                description: '',
                prepTime: '',
                cookTime: '',
                notifyEmployees: true,
              });
              setSteps([]);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>

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

        {/* Form */}
        {showForm && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Category (e.g., Appetizers, Entrees)"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Prep Time (min)"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Cook Time (min)"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                rows="2"
              />

              {/* Cooking Steps */}
              <div className="border-t border-slate-600 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Cooking Steps & Stations</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter cooking step"
                    value={currentStep}
                    onChange={(e) => setCurrentStep(e.target.value)}
                    className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                  />
                  <select
                    value={currentStation}
                    onChange={(e) => setCurrentStation(e.target.value)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
                  >
                    {stations.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Add Step
                  </button>
                </div>

                {/* Steps List */}
                <div className="space-y-2">
                  {steps.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{idx + 1}. {s.step}</p>
                        <p className="text-sm text-orange-400">Station: {s.station}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setSteps([]);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-orange-400">{item.category}</p>
                </div>
                <p className="text-xl font-bold text-green-400">${item.price}</p>
              </div>

              {item.description && (
                <p className="text-sm text-gray-300 mb-3">{item.description}</p>
              )}

              <div className="flex gap-2 text-xs text-gray-400 mb-3">
                {item.prepTime > 0 && <span>⏱️ Prep: {item.prepTime}min</span>}
                {item.cookTime > 0 && <span>🔥 Cook: {item.cookTime}min</span>}
              </div>

              {item.components && item.components.length > 0 && (
                <div className="mb-4 p-3 bg-slate-700 rounded-lg">
                  <p className="text-xs font-semibold text-orange-400 mb-2">Cooking Steps:</p>
                  <div className="space-y-1">
                    {item.components.map((comp, idx) => (
                      <p key={idx} className="text-xs text-gray-300">
                        {idx + 1}. {comp.step} <span className="text-orange-400">({comp.station})</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && !showForm && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No menu items yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemsPage;

