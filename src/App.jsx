import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RailPlanProvider } from './context/RailPlanContext';

// Layout & Protection
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public & Authentication Pages
import LandingPage from './pages/LandingPage';
import DepartmentLoginPage from './pages/auth/DepartmentLoginPage';

// Department Pages
import DeptDashboard from './pages/department/DeptDashboard';
import DeptNewRequest from './pages/department/DeptNewRequest';
import DeptRequests from './pages/department/DeptRequests';
import DeptRequestDetail from './pages/department/DeptRequestDetail';

// Central Control Pages
import PlannerDashboard from './pages/planner/PlannerDashboard';
import PlannerRequests from './pages/planner/PlannerRequests';
import RequestDetail from './pages/planner/RequestDetail';
import PlanningBoard from './pages/planner/PlanningBoard';
import ApprovedSchedule from './pages/planner/ApprovedSchedule';

export function App() {
  return (
    <RailPlanProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Hub */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Navigate to="/engineering/login" replace />} />

          {/* 1. ENGINEERING DEPARTMENT */}
          <Route path="/engineering/login" element={<DepartmentLoginPage portalType="engineering" />} />
          <Route 
            path="/engineering" 
            element={
              <ProtectedRoute allowedDept="Engineering">
                <DeptDashboard department="Engineering" />
              </ProtectedRoute>
            } 
          />
          <Route path="/engineering/dashboard" element={<Navigate to="/engineering" replace />} />
          <Route 
            path="/engineering/requests" 
            element={
              <ProtectedRoute allowedDept="Engineering">
                <DeptRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engineering/requests/new" 
            element={
              <ProtectedRoute allowedDept="Engineering">
                <DeptNewRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engineering/requests/:id" 
            element={
              <ProtectedRoute allowedDept="Engineering">
                <DeptRequestDetail />
              </ProtectedRoute>
            } 
          />

          {/* 2. SIGNAL & TELECOMMUNICATION (S&T) */}
          <Route path="/s-and-t/login" element={<DepartmentLoginPage portalType="s-and-t" />} />
          <Route 
            path="/s-and-t" 
            element={
              <ProtectedRoute allowedDept="S&T">
                <DeptDashboard department="S&T" />
              </ProtectedRoute>
            } 
          />
          <Route path="/s-and-t/dashboard" element={<Navigate to="/s-and-t" replace />} />
          <Route 
            path="/s-and-t/requests" 
            element={
              <ProtectedRoute allowedDept="S&T">
                <DeptRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/s-and-t/requests/new" 
            element={
              <ProtectedRoute allowedDept="S&T">
                <DeptNewRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/s-and-t/requests/:id" 
            element={
              <ProtectedRoute allowedDept="S&T">
                <DeptRequestDetail />
              </ProtectedRoute>
            } 
          />

          {/* 3. TRACTION DISTRIBUTION */}
          <Route path="/traction/login" element={<DepartmentLoginPage portalType="traction" />} />
          <Route 
            path="/traction" 
            element={
              <ProtectedRoute allowedDept="Traction Distribution">
                <DeptDashboard department="Traction Distribution" />
              </ProtectedRoute>
            } 
          />
          <Route path="/traction/dashboard" element={<Navigate to="/traction" replace />} />
          <Route 
            path="/traction/requests" 
            element={
              <ProtectedRoute allowedDept="Traction Distribution">
                <DeptRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/traction/requests/new" 
            element={
              <ProtectedRoute allowedDept="Traction Distribution">
                <DeptNewRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/traction/requests/:id" 
            element={
              <ProtectedRoute allowedDept="Traction Distribution">
                <DeptRequestDetail />
              </ProtectedRoute>
            } 
          />

          {/* 4. CENTRAL CONTROL & PLANNING */}
          <Route path="/control/login" element={<DepartmentLoginPage portalType="control" />} />
          <Route 
            path="/control" 
            element={
              <ProtectedRoute allowedRole="CONTROL">
                <PlannerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/control/dashboard" element={<Navigate to="/control" replace />} />
          <Route 
            path="/control/requests" 
            element={
              <ProtectedRoute allowedRole="CONTROL">
                <PlannerRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/control/requests/:id" 
            element={
              <ProtectedRoute allowedRole="CONTROL">
                <RequestDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/control/planning" 
            element={
              <ProtectedRoute allowedRole="CONTROL">
                <PlanningBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/control/approved" 
            element={
              <ProtectedRoute allowedRole="CONTROL">
                <ApprovedSchedule />
              </ProtectedRoute>
            } 
          />

          {/* Backward compatibility redirects */}
          <Route path="/planner/*" element={<Navigate to="/control" replace />} />
          <Route path="/department/*" element={<Navigate to="/engineering" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RailPlanProvider>
  );
}

export default App;
