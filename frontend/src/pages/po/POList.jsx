import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';

const mockPOs = [
  { id: 1, po_number: 'PO-2024-0001', rfq_title: 'Office Laptops Q1 Procurement', vendor_name: 'TechSupplies Ltd', total_amount: 70800, status: 'generated',      created_at: '2024-12-06' },
  { id: 2, po_number: 'PO-2024-0002', rfq_title: 'Warehouse Racking System',       vendor_name: 'BuildRight Co',    total_amount: 17700, status: 'invoice_raised', created_at: '2024-12-09' },
];

const columns = [
  { key: 'po_number', label: 'PO Number', sortable: true, width: '150px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--txt)' }}>{v}</span> },
  { key: 'rfq_title',   label: 'RFQ Reference', sortable: true,
    render: v => <span style={{ color: 'var(--txt-2)', fontSize: '13px' }}>{v}</span> },
  { key: 'vendor_name', label: 'Vendor', sortable: true,
    render: v => <span style={{ fontWeight: 500, color: 'var(--txt)' }}>{v}</span> },
  { key: 'total_amount', label: 'Total Amount', sortable: true, width: '140px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--txt)' }}>₹{Number(v || 0).toLocaleString()}</span> },
  { key: 'status', label: 'Status', width: '140px',
    render: v => <Badge status={v}>{v?.replace('_', ' ')}</Badge> },
  { key: 'id', label: '', width: '48px',
    render: v => (
      <Link to={`/po/${v}`} style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--txt-m)' }} onClick={e => e.stopPropagation()}>
        <ChevronRight size={16} />
      </Link>
    )},
];

const POList = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/po')
      .then(res => setPos(res.success && res.data ? res.data : mockPOs))
      .catch(() => setPos(mockPOs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Purchase Orders"
        subtitle="View and manage all generated purchase orders."
      />
      <DataTable
        columns={columns}
        data={pos}
        loading={loading}
        searchKeys={['po_number', 'vendor_name', 'rfq_title']}
        emptyIcon={ShoppingCart}
        emptyTitle="No purchase orders yet"
        emptyDescription="Purchase orders are created after approvals. Check back once an approval is completed."
        onRowClick={row => navigate(`/po/${row.id}`)}
      />
    </div>
  );
};

export default POList;
