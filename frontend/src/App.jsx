import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQList from './pages/rfq/RFQList';
import RFQCreate from './pages/rfq/RFQCreate';
import RFQDetail from './pages/rfq/RFQDetail';
import QuotationCompare from './pages/rfq/QuotationCompare';
import QuotationSubmit from './pages/quotations/QuotationSubmit';
import Approvals from './pages/Approvals';
import POList from './pages/po/POList';
import PODetail from './pages/po/PODetail';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';

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
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/rfqs" element={<RFQList />} />
              <Route path="/rfq/new" element={<RFQCreate />} />
              <Route path="/rfq/:id" element={<RFQDetail />} />
              <Route path="/rfq/:id/compare" element={<QuotationCompare />} />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
