import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Layout from './components/common/Layout';
import Login from './pages/auth/Login';

// Main Admin Pages
import MainAdminDashboard from './pages/main-admin/Dashboard';
import Societies from './pages/main-admin/Societies';
import Admins from './pages/main-admin/Admins';
import Reports from './pages/main-admin/Reports';

// Society Admin Pages
import SocietyAdminDashboard from './pages/society-admin/Dashboard';
import Members from './pages/society-admin/Members';
import Complaints from './pages/society-admin/Complaints';
import Maintenance from './pages/society-admin/Maintenance';
import Payments from './pages/society-admin/Payments';
import Expenses from './pages/society-admin/Expenses';
import Notifications from './pages/society-admin/Notifications';
import Events from './pages/society-admin/Events';
import Polls from './pages/society-admin/Polls';
import Documents from './pages/society-admin/Documents';

// Member Pages
import MemberDashboard from './pages/member/Dashboard';
import MemberPayments from './pages/member/Payments';
import MemberComplaints from './pages/member/Complaints';
import MemberNotifications from './pages/member/Notifications';
import MemberEvents from './pages/member/Events';
import MemberPolls from './pages/member/Polls';
import MemberDocuments from './pages/member/Documents';
import Profile from './pages/member/Profile';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector(state => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    if (user.role === 'main_admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'society_admin') return <Navigate to="/society/dashboard" replace />;
    return <Navigate to="/member/dashboard" replace />;
  }

  return children;
};

// Root Redirect Component
const RootRedirect = () => {
  const { token, user } = useSelector(state => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'main_admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'society_admin') return <Navigate to="/society/dashboard" replace />;
  return <Navigate to="/member/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/otp-login" element={<Login />} />

      {/* Protected Routes in Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<RootRedirect />} />

        {/* Main Admin Routes */}
        <Route path="admin/dashboard" element={
          <ProtectedRoute allowedRoles={['main_admin']}>
            <MainAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/societies" element={
          <ProtectedRoute allowedRoles={['main_admin']}>
            <Societies />
          </ProtectedRoute>
        } />
        <Route path="admin/admins" element={
          <ProtectedRoute allowedRoles={['main_admin']}>
            <Admins />
          </ProtectedRoute>
        } />
        <Route path="admin/reports" element={
          <ProtectedRoute allowedRoles={['main_admin']}>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Society Admin Routes */}
        <Route path="society/dashboard" element={
          <ProtectedRoute allowedRoles={['society_admin', 'staff', 'main_admin']}>
            <SocietyAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="society/members" element={
          <ProtectedRoute allowedRoles={['society_admin', 'main_admin']}>
            <Members />
          </ProtectedRoute>
        } />
        <Route path="society/complaints" element={
          <ProtectedRoute allowedRoles={['society_admin', 'staff', 'main_admin']}>
            <Complaints />
          </ProtectedRoute>
        } />
        <Route path="society/maintenance" element={
          <ProtectedRoute allowedRoles={['society_admin', 'main_admin']}>
            <Maintenance />
          </ProtectedRoute>
        } />
        <Route path="society/payments" element={
          <ProtectedRoute allowedRoles={['society_admin', 'main_admin']}>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="society/expenses" element={
          <ProtectedRoute allowedRoles={['society_admin', 'main_admin']}>
            <Expenses />
          </ProtectedRoute>
        } />
        <Route path="society/notifications" element={
          <ProtectedRoute allowedRoles={['society_admin', 'staff', 'main_admin']}>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="society/events" element={
          <ProtectedRoute allowedRoles={['society_admin', 'staff', 'main_admin']}>
            <Events />
          </ProtectedRoute>
        } />
        <Route path="society/polls" element={
          <ProtectedRoute allowedRoles={['society_admin', 'main_admin']}>
            <Polls />
          </ProtectedRoute>
        } />
        <Route path="society/documents" element={
          <ProtectedRoute allowedRoles={['society_admin', 'main_admin']}>
            <Documents />
          </ProtectedRoute>
        } />

        {/* Resident Member Routes */}
        <Route path="member/dashboard" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberDashboard />
          </ProtectedRoute>
        } />
        <Route path="member/payments" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberPayments />
          </ProtectedRoute>
        } />
        <Route path="member/complaints" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberComplaints />
          </ProtectedRoute>
        } />
        <Route path="member/notifications" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberNotifications />
          </ProtectedRoute>
        } />
        <Route path="member/events" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberEvents />
          </ProtectedRoute>
        } />
        <Route path="member/polls" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberPolls />
          </ProtectedRoute>
        } />
        <Route path="member/documents" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <MemberDocuments />
          </ProtectedRoute>
        } />
        <Route path="member/profile" element={
          <ProtectedRoute allowedRoles={['member', 'society_admin', 'main_admin']}>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
