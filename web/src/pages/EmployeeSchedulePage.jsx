import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Swap2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Google,
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function EmployeeSchedulePage() {
  const { user, token } = useAuthStore();
  const [shifts, setShifts] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('my-shifts'); // my-shifts, available, requests
  const [shiftRequests, setShiftRequests] = useState([]);

  useEffect(() => {
    fetchMyShifts();
    fetchAvailableShifts();
    fetchShiftRequests();
  }, [currentDate]);

  const fetchMyShifts = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedules/employee/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(response.data.shifts || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableShifts = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await axios.get(`${API_URL}/schedules/available/list`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableShifts(response.data.shifts || []);
    } catch (error) {
      console.error('Error fetching available shifts:', error);
    }
  };

  const fetchShiftRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for pending trades
      setShiftRequests(response.data.shifts?.filter(s => s.status === 'pending') || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleDropShift = async (shiftId) => {
    if (window.confirm('Are you sure you want to drop this shift?')) {
      try {
        await axios.post(
          `${API_URL}/schedules/${shiftId}/drop`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchMyShifts();
      } catch (error) {
        console.error('Error dropping shift:', error);
      }
    }
  };

  const handlePickupShift = async (shiftId) => {
    try {
      await axios.post(
        `${API_URL}/schedules/${shiftId}/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyShifts();
      fetchAvailableShifts();
    } catch (error) {
      console.error('Error picking up shift:', error);
    }
  };

  const handleSwapRequest = async (shiftId, targetEmployeeId) => {
    try {
      await axios.post(
        `${API_URL}/schedules/${shiftId}/trade`,
        { targetEmployeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchShiftRequests();
    } catch (error) {
      console.error('Error requesting swap:', error);
    }
  };

  const handleSyncGoogle = async () => {
    // TODO: Implement Google Calendar sync
    alert('Google Calendar sync coming soon!');
  };

  const handleExportCalendar = () => {
    // TODO: Implement calendar export
    alert('Export feature coming soon!');
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
      days.push(<div key={`empty-${i}`} className="bg-slate-700/50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayShifts = getShiftsForDay(day);
      days.push(
        <div
          key={day}
          className="bg-slate-700 border border-slate-600 p-2 min-h-24 hover:bg-slate-600 transition cursor-pointer rounded"
        >
          <div className="font-bold text-white mb-1">{day}</div>
          <div className="space-y-1">
            {dayShifts.map(shift => (
              <div
                key={shift.id}
                className="text-xs bg-green-500/20 text-green-300 p-1 rounded truncate border border-green-500/30"
              >
                {shift.startTime && new Date(shift.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            ))}
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
            <h1 className="text-4xl font-bold text-white mb-2">My Schedule</h1>
            <p className="text-slate-400">View and manage your shifts</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSyncGoogle}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Google size={18} />
              Sync Google
            </button>
            <button
              onClick={handleExportCalendar}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg w-fit">
          {['my-shifts', 'available', 'requests'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded font-semibold transition ${
                view === v
                  ? 'bg-green-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v === 'my-shifts' ? 'My Shifts' : v === 'available' ? 'Available' : 'Requests'}
            </button>
          ))}
        </div>
      </div>

      {/* My Shifts Calendar */}
      {view === 'my-shifts' && (
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700">
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

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          {/* Shifts List */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Upcoming Shifts</h3>
            {loading ? (
              <div className="text-center text-slate-400">Loading shifts...</div>
            ) : shifts.length === 0 ? (
              <div className="text-center text-slate-400 py-8 bg-slate-800 rounded-lg">No shifts scheduled</div>
            ) : (
              shifts.map(shift => (
                <div
                  key={shift.id}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-green-500 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <Clock className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {new Date(shift.startTime).toLocaleDateString()}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDropShift(shift.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Available Shifts */}
      {view === 'available' && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white mb-4">Available Shifts</h3>
          {availableShifts.length === 0 ? (
            <div className="text-center text-slate-400 py-8 bg-slate-800 rounded-lg">No available shifts</div>
          ) : (
            availableShifts.map(shift => (
              <div
                key={shift.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Plus className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePickupShift(shift.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Pick Up
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Shift Requests */}
      {view === 'requests' && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
          {shiftRequests.length === 0 ? (
            <div className="text-center text-slate-400 py-8 bg-slate-800 rounded-lg">No pending requests</div>
          ) : (
            shiftRequests.map(request => (
              <div
                key={request.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <AlertCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Shift Swap Request</h3>
                    <p className="text-slate-400 text-sm">Pending manager approval</p>
                  </div>
                </div>
                <div className="text-yellow-400 font-semibold">Pending</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

