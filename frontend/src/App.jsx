import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Placeholder for other pages
const Placeholder = ({ title }) => (
  <div className="p-4 bg-surface rounded-xl border border-border h-full flex flex-col items-center justify-center">
    <h2 className="text-2xl font-bold text-primary mb-2">{title} Page</h2>
    <p className="text-text-secondary">This section is currently under development.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendors" element={<Placeholder title="Vendors" />} />
              <Route path="/rfqs" element={<Placeholder title="RFQs" />} />
              <Route path="/approvals" element={<Placeholder title="Approvals" />} />
              <Route path="/po" element={<Placeholder title="Purchase Orders" />} />
              <Route path="/invoices" element={<Placeholder title="Invoices" />} />
              <Route path="/activity" element={<Placeholder title="Activity Logs" />} />
              <Route path="/reports" element={<Placeholder title="Reports" />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
