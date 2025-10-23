import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Send,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
  SwapCw,
  Plus,
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SchedulePage = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  // State Management
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openShifts, setOpenShifts] = useState([]);
  const [tradeRequests, setTradeRequests] = useState([]);
  const [pickRequests, setPickRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UI State
  const [view, setView] = useState('schedule'); // schedule, trades, picks, requests
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showPickModal, setShowPickModal] = useState(false);
  const [tradeWithEmployee, setTradeWithEmployee] = useState('');
  const [tradeWithShift, setTradeWithShift] = useState('');
  const [isAdmin, setIsAdmin] = useState(user?.role === 'Manager' || user?.role === 'Admin');

  // Fetch data on mount and when week changes
  useEffect(() => {
    fetchAllData();
  }, [currentWeek, token]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Get week start and end
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Fetch all data in parallel
      const [shiftsRes, employeesRes, openRes, tradesRes, picksRes] = await Promise.all([
        axios.get(`${API_URL}/schedules/employee/${user?.uid}`, {
          params: { weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() },
          headers,
        }),
        axios.get(`${API_URL}/employees`, { headers }),
        axios.get(`${API_URL}/schedules/open-shifts`, {
          params: { weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() },
          headers,
        }),
        axios.get(`${API_URL}/trades/requests`, { headers }),
        axios.get(`${API_URL}/picks/requests`, { headers }),
      ]);

      setShifts(shiftsRes.data.shifts || []);
      setEmployees(employeesRes.data.employees || []);
      setOpenShifts(openRes.data.shifts || []);
      setTradeRequests(tradesRes.data.trades || []);
      setPickRequests(picksRes.data.picks || []);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const start = getWeekStart(currentWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Trade Shift Handler
  const handleTradeShift = async (e) => {
    e.preventDefault();
    if (!selectedShift || !tradeWithEmployee || !tradeWithShift) {
      setError('Please select all required fields');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/trades/request`,
        {
          myShiftId: selectedShift.id,
          targetEmployeeId: tradeWithEmployee,
          targetShiftId: tradeWithShift,
          reason: 'Shift trade request',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Trade request submitted! Waiting for admin approval.');
      setShowTradeModal(false);
      setSelectedShift(null);
      setTradeWithEmployee('');
      setTradeWithShift('');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit trade request');
    }
  };

  // Pick Open Shift Handler
  const handlePickShift = async (e) => {
    e.preventDefault();
    if (!selectedShift) {
      setError('Please select a shift');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/picks/request`,
        {
          shiftId: selectedShift.id,
          reason: 'Requesting to pick this shift',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Pick request submitted! Waiting for admin approval.');
      setShowPickModal(false);
      setSelectedShift(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit pick request');
    }
  };

  // Admin: Approve Trade
  const handleApproveTrade = async (tradeId) => {
    try {
      await axios.post(
        `${API_URL}/trades/${tradeId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Trade approved!');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve trade');
    }
  };

  // Admin: Deny Trade
  const handleDenyTrade = async (tradeId) => {
    try {
      await axios.post(
        `${API_URL}/trades/${tradeId}/deny`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Trade denied');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deny trade');
    }
  };

  // Admin: Approve Pick
  const handleApprovePick = async (pickId) => {
    try {
      await axios.post(
        `${API_URL}/picks/${pickId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Pick approved!');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve pick');
    }
  };

  // Admin: Deny Pick
  const handleDenyPick = async (pickId) => {
    try {
      await axios.post(
        `${API_URL}/picks/${pickId}/deny`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Pick denied');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deny pick');
    }
  };

  const getEmployeeName = (employeeId) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown';
  };

  const getShiftsByDay = (date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate.toDateString() === date.toDateString();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isAdmin ? 'Schedule Requests' : 'My Schedule'}
                </h1>
                <p className="text-sm text-gray-600">
                  Week of {getWeekStart(currentWeek).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setView('schedule')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                view === 'schedule'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Schedule
            </button>
            {!isAdmin && (
              <>
                <button
                  onClick={() => setView('trades')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    view === 'trades'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <SwapCw className="w-4 h-4 inline mr-2" />
                  Trade Shifts
                </button>
                <button
                  onClick={() => setView('picks')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    view === 'picks'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Pick Shifts
                </button>
              </>
            )}
            {isAdmin && (
              <button
                onClick={() => setView('requests')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  view === 'requests'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Requests ({tradeRequests.length + pickRequests.length})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SCHEDULE VIEW */}
        {view === 'schedule' && (
          <div>
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {getWeekStart(currentWeek).toLocaleDateString()} - {new Date(getWeekStart(currentWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </h2>
              <button
                onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-8">
              {getWeekDays().map((date, idx) => {
                const dayShifts = getShiftsByDay(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-4 min-h-48 ${
                      isToday
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-3">
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </h3>
                    <div className="space-y-2">
                      {dayShifts.length === 0 ? (
                        <p className="text-sm text-gray-500">No shifts</p>
                      ) : (
                        dayShifts.map(shift => (
                          <div
                            key={shift.id}
                            className="bg-blue-100 border-l-4 border-blue-600 p-2 rounded text-sm"
                          >
                            <p className="font-semibold text-blue-900">{shift.role || 'Shift'}</p>
                            <p className="text-blue-700 text-xs">
                              {new Date(shift.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' - '}
                              {new Date(shift.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {!isAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedShift(shift);
                                  setShowTradeModal(true);
                                }}
                                className="mt-2 w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition"
                              >
                                Trade
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shift Cards View */}
            {shifts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No shifts scheduled for this week</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts.map(shift => (
                  <div
                    key={shift.id}
                    className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {new Date(shift.startTime).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-600">{shift.role || 'Shift'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        shift.status === 'posted'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {shift.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>
                          {new Date(shift.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(shift.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {shift.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {shift.notes}
                        </p>
                      )}
                    </div>

                    {!isAdmin && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedShift(shift);
                            setShowTradeModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          <SwapCw className="w-4 h-4" />
                          Trade
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRADE SHIFTS VIEW */}
        {view === 'trades' && !isAdmin && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trade Your Shifts</h2>
              <p className="text-gray-600">Select a shift to trade with another employee</p>
            </div>

            {shifts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No shifts to trade</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts.map(shift => (
                  <div
                    key={shift.id}
                    className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{shift.role || 'Shift'}</p>
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>
                        {new Date(shift.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(shift.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedShift(shift);
                        setShowTradeModal(true);
                      }}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <SwapCw className="w-4 h-4" />
                      Propose Trade
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PICK SHIFTS VIEW */}
        {view === 'picks' && !isAdmin && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pick Open Shifts</h2>
              <p className="text-gray-600">Request to pick an available shift</p>
            </div>

            {openShifts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No open shifts available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openShifts.map(shift => (
                  <div
                    key={shift.id}
                    className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{shift.role || 'Open Shift'}</p>
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span>
                        {new Date(shift.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(shift.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedShift(shift);
                        setShowPickModal(true);
                      }}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Request Shift
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN REQUESTS VIEW */}
        {view === 'requests' && isAdmin && (
          <div className="space-y-8">
            {/* Trade Requests */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trade Requests</h2>
              {tradeRequests.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg">
                  <p className="text-gray-600">No trade requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tradeRequests.map(trade => (
                    <div
                      key={trade.id}
                      className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {getEmployeeName(trade.requestedBy)} ↔ {getEmployeeName(trade.targetEmployeeId)}
                          </h3>
                          <p className="text-sm text-gray-600">Status: {trade.status}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          trade.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : trade.status === 'approved'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {trade.status}
                        </span>
                      </div>
                      {trade.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveTrade(trade.id)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenyTrade(trade.id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pick Requests */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pick Requests</h2>
              {pickRequests.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg">
                  <p className="text-gray-600">No pick requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pickRequests.map(pick => (
                    <div
                      key={pick.id}
                      className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {getEmployeeName(pick.requestedBy)} - {new Date(pick.shiftDate).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-gray-600">Status: {pick.status}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pick.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : pick.status === 'approved'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {pick.status}
                        </span>
                      </div>
                      {pick.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePick(pick.id)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenyPick(pick.id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Trade Modal */}
      {showTradeModal && selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Propose Trade</h2>
              <button
                onClick={() => {
                  setShowTradeModal(false);
                  setSelectedShift(null);
                  setTradeWithEmployee('');
                  setTradeWithShift('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTradeShift} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Shift
                </label>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedShift.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedShift.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(selectedShift.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Trade With Employee
                </label>
                <select
                  value={tradeWithEmployee}
                  onChange={(e) => {
                    setTradeWithEmployee(e.target.value);
                    setTradeWithShift('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an employee</option>
                  {employees
                    .filter(e => e.id !== user?.uid)
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>

              {tradeWithEmployee && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Their Shift
                  </label>
                  <select
                    value={tradeWithShift}
                    onChange={(e) => setTradeWithShift(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a shift</option>
                    {shifts
                      .filter(s => s.employeeId === tradeWithEmployee)
                      .map(shift => (
                        <option key={shift.id} value={shift.id}>
                          {new Date(shift.startTime).toLocaleDateString()} -{' '}
                          {new Date(shift.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTradeModal(false);
                    setSelectedShift(null);
                    setTradeWithEmployee('');
                    setTradeWithShift('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pick Modal */}
      {showPickModal && selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Request Shift</h2>
              <button
                onClick={() => {
                  setShowPickModal(false);
                  setSelectedShift(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePickShift} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Shift Details
                </label>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedShift.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedShift.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(selectedShift.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{selectedShift.role || 'Shift'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPickModal(false);
                    setSelectedShift(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

