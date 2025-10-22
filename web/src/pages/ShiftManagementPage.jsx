import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Share2,
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ShiftManagementPage() {
  const { user, token } = useAuthStore();
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // calendar, list, create
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    startTime: '',
    endTime: '',
    recurring: false,
  });

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, [currentDate]);

  const fetchShifts = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await axios.get(`${API_URL}/schedules`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setShifts(response.data.shifts || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/schedules/shifts`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ employeeId: '', startTime: '', endTime: '', recurring: false });
      setView('calendar');
      fetchShifts();
    } catch (error) {
      console.error('Error creating shift:', error);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await axios.delete(`${API_URL}/schedules/shifts/${shiftId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
      }
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getShiftsForDay = (day) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate.getDate() === day;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayShifts = getShiftsForDay(day);
      days.push(
        <div
          key={day}
          className="bg-white border border-gray-200 p-2 min-h-24 hover:bg-blue-50 transition cursor-pointer"
        >
          <div className="font-bold text-gray-700 mb-1">{day}</div>
          <div className="space-y-1">
            {dayShifts.slice(0, 2).map(shift => (
              <div
                key={shift.id}
                className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate"
              >
                {shift.startTime && new Date(shift.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            ))}
            {dayShifts.length > 2 && (
              <div className="text-xs text-gray-500">+{dayShifts.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Shift Management</h1>
            <p className="text-slate-400">Manage employee schedules and shifts</p>
          </div>
          {user?.role === 'Manager' && (
            <button
              onClick={() => setView('create')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105"
            >
              <Plus size={20} />
              Create Shift
            </button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg w-fit">
          {['calendar', 'list', 'create'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded font-semibold transition ${
                view === v
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <ChevronLeft className="text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <ChevronRight className="text-white" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-400">Loading shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No shifts found</div>
          ) : (
            shifts.map(shift => (
              <div
                key={shift.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {employees.find(e => e.id === shift.employeeId)?.name || 'Unknown'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                {user?.role === 'Manager' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedShift(shift);
                        setView('create');
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit View */}
      {view === 'create' && user?.role === 'Manager' && (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700 max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            {selectedShift ? 'Edit Shift' : 'Create New Shift'}
          </h2>
          <form onSubmit={handleCreateShift} className="space-y-6">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Select an employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span className="text-slate-300 font-semibold">Recurring Shift</span>
            </label>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
              >
                {selectedShift ? 'Update Shift' : 'Create Shift'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('calendar');
                  setSelectedShift(null);
                  setFormData({ employeeId: '', startTime: '', endTime: '', recurring: false });
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

