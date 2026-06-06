import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQList from './pages/rfq/RFQList';
import RFQCreate from './pages/rfq/RFQCreate';
import RFQDetail from './pages/rfq/RFQDetail';
import QuotationCompare from './pages/rfq/QuotationCompare';
import QuotationList from './pages/quotations/QuotationList';
import QuotationSubmit from './pages/quotations/QuotationSubmit';
import Approvals from './pages/Approvals';
import POList from './pages/po/POList';
import PODetail from './pages/po/PODetail';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';
import UsersList from './pages/UsersList';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/vendors/new" element={<Vendors openAddModal={true} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/rfqs" element={<RFQList />} />
              <Route path="/rfq/new" element={<RFQCreate />} />
              <Route path="/rfq/:id" element={<RFQDetail />} />
              <Route path="/rfq/:id/compare" element={<QuotationCompare />} />
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/quotations/:id" element={<QuotationSubmit />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/po" element={<POList />} />
              <Route path="/po/:id" element={<PODetail />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/activity" element={<ActivityLogs />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
