import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

import { AdminDashboard } from './pages/AdminDashboard';
import { CreditOfficerDashboard } from './pages/CreditOfficerDashboard';
import { RiskAnalystDashboard } from './pages/RiskAnalystDashboard';
import { CreditManagerDashboard } from './pages/CreditManagerDashboard';
import { ComplianceOfficerDashboard } from './pages/ComplianceOfficerDashboard';
import { ViewerDashboard } from './pages/ViewerDashboard';
import { HackathonDemo } from './pages/HackathonDemo';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If a specific role is required and user lacks it, kick them back
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Automatic route redirection based on role
const RoleRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'CREDIT_OFFICER': return <CreditOfficerDashboard />;
    case 'RISK_ANALYST': return <RiskAnalystDashboard />;
    case 'CREDIT_MANAGER': return <CreditManagerDashboard />;
    case 'COMPLIANCE_OFFICER': return <ComplianceOfficerDashboard />;
    case 'VIEWER': return <ViewerDashboard />;
    default: return <Navigate to="/login" replace />;
  }
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* The root Dashboard route now redirects internally based on the user's role */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RoleRouter />
        </ProtectedRoute>
      } />

      {/* Allow direct URL hits for roles as well (optional, but good for linking) */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/credit-officer" element={<ProtectedRoute requiredRole="CREDIT_OFFICER"><CreditOfficerDashboard /></ProtectedRoute>} />
      <Route path="/risk-analyst" element={<ProtectedRoute requiredRole="RISK_ANALYST"><RiskAnalystDashboard /></ProtectedRoute>} />
      <Route path="/credit-manager" element={<ProtectedRoute requiredRole="CREDIT_MANAGER"><CreditManagerDashboard /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute requiredRole="COMPLIANCE_OFFICER"><ComplianceOfficerDashboard /></ProtectedRoute>} />
      <Route path="/viewer" element={<ProtectedRoute requiredRole="VIEWER"><ViewerDashboard /></ProtectedRoute>} />
      <Route path="/demo" element={<HackathonDemo />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
