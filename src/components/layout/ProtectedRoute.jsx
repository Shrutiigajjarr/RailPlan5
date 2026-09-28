import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRailPlan } from '../../context/RailPlanContext';

export const ProtectedRoute = ({ children, allowedDept = null, allowedRole = null }) => {
  const { currentUser } = useRailPlan();
  const location = useLocation();

  // If no user is logged in, redirect to login page for the attempted portal
  if (!currentUser) {
    if (location.pathname.startsWith('/engineering')) return <Navigate to="/engineering/login" replace />;
    if (location.pathname.startsWith('/s-and-t')) return <Navigate to="/s-and-t/login" replace />;
    if (location.pathname.startsWith('/traction')) return <Navigate to="/traction/login" replace />;
    if (location.pathname.startsWith('/control')) return <Navigate to="/control/login" replace />;
    return <Navigate to="/" replace />;
  }

  // If page requires CONTROL role (Central Planning)
  if (allowedRole === 'CONTROL' && currentUser.role !== 'CONTROL') {
    // Redirect department user to their own portal
    if (currentUser.department === 'Engineering') return <Navigate to="/engineering" replace />;
    if (currentUser.department === 'S&T') return <Navigate to="/s-and-t" replace />;
    if (currentUser.department === 'Traction Distribution') return <Navigate to="/traction" replace />;
    return <Navigate to="/engineering" replace />;
  }

  // If page requires specific Department
  if (allowedDept && currentUser.department !== allowedDept) {
    // If Central Control user tries to access department routes, or cross-department navigation
    if (currentUser.role === 'CONTROL') return <Navigate to="/control" replace />;
    if (currentUser.department === 'Engineering') return <Navigate to="/engineering" replace />;
    if (currentUser.department === 'S&T') return <Navigate to="/s-and-t" replace />;
    if (currentUser.department === 'Traction Distribution') return <Navigate to="/traction" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
