import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';

const mockQuotations = [
  { id: 101, rfq_number: 'RFQ-2026-001', rfq_title: 'Office Furniture Procurement Q2', vendor_name: 'Infra Supplies',  grand_total: 185000, status: 'submitted', submitted_at: '2026-06-01', rfq_id: 1 },
  { id: 102, rfq_number: 'RFQ-2026-001', rfq_title: 'Office Furniture Procurement Q2', vendor_name: 'TechCore LTD',    grand_total: 200010, status: 'submitted', submitted_at: '2026-06-02', rfq_id: 1 },
  { id: 103, rfq_number: 'RFQ-2026-002', rfq_title: 'IT Equipment Procurement',         vendor_name: 'TechWorld Ltd',   grand_total: 340000, status: 'draft',     submitted_at: null,         rfq_id: 2 },
  { id: 104, rfq_number: 'RFQ-2026-003', rfq_title: 'Cleaning Supplies Q3',             vendor_name: 'CleanPro',        grand_total: 52000,  status: 'approved',  submitted_at: '2026-05-28', rfq_id: 3 },
  { id: 105, rfq_number: 'RFQ-2026-003', rfq_title: 'Cleaning Supplies Q3',             vendor_name: 'HygienePlus',     grand_total: 48500,  status: 'rejected',  submitted_at: '2026-05-27', rfq_id: 3 },
];

const QuotationList = () => {
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';
  const canCompare = user?.role === 'manager' || user?.role === 'admin';
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quotations')
      .then(res => {
        if (res.success && res.data) {
          setQuotations(res.data.map(q => ({
            id: q.id,
            rfq_number:  q.RFQ?.rfq_number || 'N/A',
            rfq_title:   q.RFQ?.title      || 'Unknown RFQ',
            vendor_name: q.Vendor?.company_name || 'Unknown Vendor',
            grand_total: parseFloat(q.total_price || 0),
            status:      q.status,
            submitted_at: q.submitted_at,
            rfq_id:      q.rfq_id,
          })));
        } else {
          setQuotations(mockQuotations);
        }
      })
      .catch(() => setQuotations(mockQuotations))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'rfq_number', label: 'RFQ', sortable: true, width: '140px',
      render: (v, row) => (
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--txt-2)', display: 'block' }}>{v}</span>
          <span style={{ fontWeight: 500, fontSize: '13px', color: 'var(--txt)' }}>{row.rfq_title}</span>
        </div>
      )},
    { key: 'vendor_name', label: 'Vendor', sortable: true,
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '999px',
            backgroundColor: 'var(--primary-m)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, flexShrink: 0,
          }}>
            {v?.charAt(0)}
          </div>
          <span style={{ fontWeight: 500, color: 'var(--txt)' }}>{v}</span>
        </div>
      )},
    { key: 'grand_total', label: 'Grand Total', sortable: true, width: '140px',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--txt)' }}>₹{Number(v || 0).toLocaleString()}</span> },
    { key: 'status', label: 'Status', width: '120px',
      render: v => <Badge status={v} /> },
    { key: 'submitted_at', label: 'Submitted', sortable: true, width: '130px',
      render: v => v
        ? <span style={{ fontSize: '12px', color: 'var(--txt-2)' }}>{new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        : <span style={{ fontSize: '12px', color: 'var(--txt-m)', fontStyle: 'italic' }}>Not submitted</span> },
    { key: 'id', label: '', width: '80px',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          {isVendor && row.status === 'draft' && (
            <Link to={`/quotations/${v}`} onClick={e => e.stopPropagation()}
              className="btn btn-sm btn-primary" style={{ fontSize: '12px', padding: '5px 10px' }}>
              Edit
            </Link>
          )}
        </div>
      )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quotations"
        subtitle="View and manage all vendor quotations."
      />
      <DataTable
        columns={columns}
        data={quotations}
        loading={loading}
        searchKeys={['rfq_number', 'rfq_title', 'vendor_name']}
        emptyIcon={FileText}
        emptyTitle="No quotations yet"
        emptyDescription="Quotations will appear here once vendors submit their bids."
        onRowClick={row => { if (!isVendor || row.status !== 'draft') return; navigate(`/quotations/${row.id}`); }}
      />
    </div>
  );
};

export default QuotationList;
