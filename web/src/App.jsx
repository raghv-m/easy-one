import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { initializeFirebase } from './config/firebase';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import InvitePage from './pages/InvitePage';
import Dashboard from './pages/Dashboard';
import POSPage from './pages/POSPage';
import KitchenScreenPage from './pages/KitchenScreenPage';
import StationScreenPage from './pages/StationScreenPage';
import ExpoScreenPage from './pages/ExpoScreenPage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import PunchClockPage from './pages/PunchClockPage';
import MenuManagementPage from './pages/MenuManagementPage';
import MenuItemsPage from './pages/MenuItemsPage';
import MessagingPage from './pages/MessagingPage';
import ShiftManagementPage from './pages/ShiftManagementPage';
import EmployeeSchedulePage from './pages/EmployeeSchedulePage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import BillGenerationPage from './pages/BillGenerationPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    initializeFirebase();
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/invite" element={<InvitePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/punch" element={<PunchClockPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/kitchen" element={<KitchenScreenPage />} />
          <Route path="/kitchen/station/:station" element={<StationScreenPage />} />
          <Route path="/expo" element={<ExpoScreenPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/menu" element={<MenuManagementPage />} />
          <Route path="/menu-items" element={<MenuItemsPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/shifts" element={<ShiftManagementPage />} />
          <Route path="/my-schedule" element={<EmployeeSchedulePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/manager" element={<ManagerDashboardPage />} />
          <Route path="/bill" element={<BillGenerationPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

