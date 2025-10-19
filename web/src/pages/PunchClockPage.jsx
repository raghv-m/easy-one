import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PunchClockPage = () => {
  const [status, setStatus] = useState('out');
  const [currentPunch, setCurrentPunch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const token = useAuthStore((state) => state.token);

  // Fetch current punch status
  useEffect(() => {
    fetchPunchStatus();
    const interval = setInterval(fetchPunchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update elapsed time
  useEffect(() => {
    if (status === 'in' && currentPunch?.punchInTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const punchIn = new Date(currentPunch.punchInTime);
        const diff = Math.floor((now - punchIn) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, currentPunch]);

  const fetchPunchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/punches/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(response.data.status);
      setCurrentPunch(response.data.currentPunch);
      setError('');
    } catch (err) {
      console.error('Error fetching punch status:', err);
    }
  };

  const handlePunchIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_URL}/punches/in`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus('in');
      setCurrentPunch(response.data.punch);
      setSuccess('Punched in successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to punch in');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_URL}/punches/out`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus('out');
      setCurrentPunch(response.data.punch);
      setSuccess(`Punched out successfully! Total time: ${response.data.punch.duration} minutes`);
      setElapsedTime('00:00:00');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to punch out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Punch Clock</h1>
          </div>
          <p className="text-gray-600">Track your work hours</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Current Status */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              status === 'in' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {status === 'in' ? (
                <>
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Clocked In</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span className="font-semibold">Clocked Out</span>
                </>
              )}
            </div>

            {/* Elapsed Time */}
            {status === 'in' && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Time Elapsed</p>
                <p className="text-5xl font-bold text-blue-600 font-mono">{elapsedTime}</p>
              </div>
            )}

            {/* Punch In Time */}
            {currentPunch?.punchInTime && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm">Punched In At</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(currentPunch.punchInTime).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Punch Out Time */}
            {currentPunch?.punchOutTime && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm">Punched Out At</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(currentPunch.punchOutTime).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Duration */}
            {currentPunch?.duration && (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-gray-600 text-sm">Total Duration</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {Math.floor(currentPunch.duration / 60)}h {currentPunch.duration % 60}m
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'out' ? (
              <button
                onClick={handlePunchIn}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'Punching In...' : 'Punch In'}
              </button>
            ) : (
              <button
                onClick={handlePunchOut}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                {loading ? 'Punching Out...' : 'Punch Out'}
              </button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can only punch in if you have a shift assigned for today. Contact your manager if you need to request a shift.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PunchClockPage;

