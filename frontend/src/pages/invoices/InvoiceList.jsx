import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Receipt, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';

const mockInvoices = [
  { id: 1, invoice_number: 'INV-2024-0001', po_number: 'PO-2024-0001', vendor_name: 'TechSupplies Ltd', amount_due: 70800, status: 'paid',      created_at: '2024-12-06' },
  { id: 2, invoice_number: 'INV-2024-0002', po_number: 'PO-2024-0002', vendor_name: 'BuildRight Co',   amount_due: 17700, status: 'generated',  created_at: '2024-12-10' },
];

const columns = [
  { key: 'invoice_number', label: 'Invoice #', sortable: true, width: '160px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--txt)' }}>{v}</span> },
  { key: 'po_number', label: 'PO Reference', sortable: true, width: '140px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--txt-2)' }}>{v}</span> },
  { key: 'vendor_name', label: 'Vendor', sortable: true,
    render: v => <span style={{ fontWeight: 500, color: 'var(--txt)' }}>{v}</span> },
  { key: 'amount_due', label: 'Amount Due', sortable: true, width: '140px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--txt)' }}>₹{Number(v || 0).toLocaleString()}</span> },
  { key: 'status', label: 'Status', width: '120px',
    render: v => <Badge status={v}>{v}</Badge> },
  { key: 'id', label: '', width: '48px',
    render: v => (
      <Link to={`/invoices/${v}`} style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--txt-m)' }} onClick={e => e.stopPropagation()}>
        <ChevronRight size={16} />
      </Link>
    )},
];

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices')
      .then(res => setInvoices(res.success && res.data ? res.data : mockInvoices))
      .catch(() => setInvoices(mockInvoices))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Invoices"
        subtitle="Track and manage all procurement invoices."
      />
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchKeys={['invoice_number', 'vendor_name', 'po_number']}
        emptyIcon={Receipt}
        emptyTitle="No invoices found"
        emptyDescription="Invoices are generated from purchase orders once received."
        onRowClick={row => navigate(`/invoices/${row.id}`)}
      />
    </div>
  );
};

export default InvoiceList;
