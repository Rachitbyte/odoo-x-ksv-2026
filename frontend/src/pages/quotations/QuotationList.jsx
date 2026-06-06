import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye, Send, Filter, Search } from 'lucide-react';
import api from '../../lib/axios';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const mockQuotations = [
  { id: 101, rfq_number: 'RFQ-2026-001', rfq_title: 'Office Furniture Procurement Q2', vendor_name: 'Infra Supplies', grand_total: 185000, status: 'submitted', submitted_at: '2026-06-01', rfq_id: 1 },
  { id: 102, rfq_number: 'RFQ-2026-001', rfq_title: 'Office Furniture Procurement Q2', vendor_name: 'TechCore LTD', grand_total: 200010, status: 'submitted', submitted_at: '2026-06-02', rfq_id: 1 },
  { id: 103, rfq_number: 'RFQ-2026-001', rfq_title: 'Office Furniture Procurement Q2', vendor_name: 'Office Need Co.', grand_total: 214800, status: 'submitted', submitted_at: '2026-06-02', rfq_id: 1 },
  { id: 104, rfq_number: 'RFQ-2026-002', rfq_title: 'IT Equipment Procurement', vendor_name: 'TechWorld Ltd', grand_total: 340000, status: 'draft', submitted_at: null, rfq_id: 2 },
  { id: 105, rfq_number: 'RFQ-2026-003', rfq_title: 'Cleaning Supplies Q3', vendor_name: 'CleanPro', grand_total: 52000, status: 'approved', submitted_at: '2026-05-28', rfq_id: 3 },
  { id: 106, rfq_number: 'RFQ-2026-003', rfq_title: 'Cleaning Supplies Q3', vendor_name: 'HygienePlus', grand_total: 48500, status: 'rejected', submitted_at: '2026-05-27', rfq_id: 3 },
];

const statusConfig = {
  draft:     { label: 'Draft',     icon: Clock,        color: 'bg-warning/10 text-warning border border-warning/30' },
  submitted: { label: 'Submitted', icon: Send,         color: 'bg-info/10 text-info border border-info/30' },
  approved:  { label: 'Approved',  icon: CheckCircle,  color: 'bg-success/10 text-success border border-success/30' },
  rejected:  { label: 'Rejected',  icon: XCircle,      color: 'bg-danger/10 text-danger border border-danger/30' },
};

const QuotationList = () => {
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';
  const canCompare = user?.role === 'officer' || user?.role === 'manager';

  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await api.get('/quotations');
        if (res.success && res.data) {
          const mapped = res.data.map(q => ({
            id: q.id,
            rfq_number: q.RFQ?.rfq_number || 'N/A',
            rfq_title: q.RFQ?.title || 'Unknown RFQ',
            vendor_name: q.Vendor?.company_name || 'Unknown Vendor',
            grand_total: parseFloat(q.total_price || 0),
            status: q.status,
            submitted_at: q.submitted_at,
            rfq_id: q.rfq_id
          }));
          setQuotations(mapped);
        } else {
          setQuotations(mockQuotations);
        }
      } catch (error) {
        setQuotations(mockQuotations);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const filtered = quotations.filter(q => {
    const matchSearch = !search ||
      q.rfq_number.toLowerCase().includes(search.toLowerCase()) ||
      q.rfq_title.toLowerCase().includes(search.toLowerCase()) ||
      q.vendor_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:     quotations.length,
    submitted: quotations.filter(q => q.status === 'submitted').length,
    approved:  quotations.filter(q => q.status === 'approved').length,
    draft:     quotations.filter(q => q.status === 'draft').length,
  };

  if (loading) return <QuotationSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quotations</h1>
          <p className="text-sm text-text-secondary mt-0.5">View and manage all vendor quotations</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total,     color: 'text-text-primary', bg: 'bg-surface' },
          { label: 'Submitted', value: stats.submitted, color: 'text-info',   bg: 'bg-info/5'  },
          { label: 'Approved',  value: stats.approved,  color: 'text-success', bg: 'bg-success/5' },
          { label: 'Draft',     value: stats.draft,     color: 'text-warning', bg: 'bg-warning/5' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-text-secondary mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by RFQ, vendor..."
            className="w-full !pl-9 !py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-secondary shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm !py-2"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">RFQ</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium text-right">Grand Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-text-secondary">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No quotations found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filtered.map(q => {
                  const cfg = statusConfig[q.status] || statusConfig.draft;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={q.id} className="hover:bg-background/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-text-secondary">{q.rfq_number}</p>
                        <p className="font-medium text-text-primary text-sm mt-0.5">{q.rfq_title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {q.vendor_name.charAt(0)}
                          </div>
                          <span className="text-text-primary font-medium">{q.vendor_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-text-primary">
                        ₹{q.grand_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.color)}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-sm">
                        {q.submitted_at
                          ? new Date(q.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : <span className="text-text-secondary/50 italic">Not submitted</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {canCompare && (
                            <Link
                              to={`/rfq/${q.rfq_id}/compare`}
                              className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Compare Quotations"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          {isVendor && q.status === 'draft' && (
                            <Link
                              to={`/quotations/${q.id}`}
                              className="text-xs btn bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors px-3 py-1 rounded-md font-medium"
                            >
                              Edit & Submit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-background/30 text-xs text-text-secondary">
            Showing {filtered.length} of {quotations.length} quotations
          </div>
        )}
      </div>
    </div>
  );
};

const QuotationSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-surface rounded w-48" />
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface border border-border rounded-xl" />)}
    </div>
    <div className="h-14 bg-surface border border-border rounded-xl" />
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex gap-6 px-6 py-4 border-b border-border last:border-0">
          <div className="h-4 bg-border rounded w-32" />
          <div className="h-4 bg-border rounded w-24" />
          <div className="h-4 bg-border rounded w-20 ml-auto" />
          <div className="h-6 bg-border rounded-full w-20" />
        </div>
      ))}
    </div>
  </div>
);

export default QuotationList;
