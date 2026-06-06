import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const initialMockRFQs = [
  { id: 1, rfq_number: 'RFQ-2024-0001', title: 'Office IT Equipment',    quantity: 50,   unit: 'pcs',   deadline: '2024-12-15', status: 'open',         created_at: '2024-12-01' },
  { id: 2, rfq_number: 'RFQ-2024-0002', title: 'Stationery Supplies Q1', quantity: 1000, unit: 'packs', deadline: '2024-12-20', status: 'under_review',  created_at: '2024-12-05' },
  { id: 3, rfq_number: 'RFQ-2024-0003', title: 'Warehouse Racking System', quantity: 10, unit: 'units', deadline: '2024-11-30', status: 'approved',      created_at: '2024-11-15' },
  { id: 4, rfq_number: 'RFQ-2024-0004', title: 'Marketing Event Catering', quantity: 200, unit: 'plates', deadline: '2025-01-10', status: 'draft',      created_at: '2024-12-10' },
];

const columns = [
  { key: 'rfq_number', label: 'RFQ Number', sortable: true, width: '150px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>{v}</span> },
  { key: 'title',    label: 'Title',    sortable: true,
    render: v => <span style={{ fontWeight: 500, color: 'var(--txt)' }}>{v}</span> },
  { key: 'quantity', label: 'Quantity', sortable: true, width: '120px',
    render: (v, row) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--txt-2)' }}>{v} {row.unit}</span> },
  { key: 'deadline', label: 'Deadline', sortable: true, width: '130px',
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--txt-2)' }}>{v}</span> },
  { key: 'status', label: 'Status', width: '130px',
    render: v => <Badge status={v} /> },
  { key: 'id', label: '', width: '48px',
    render: (v) => (
      <Link to={`/rfq/${v}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--txt-m)' }}
        onClick={e => e.stopPropagation()}>
        <ChevronRight size={16} />
      </Link>
    )},
];

const RFQList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOfficer = user?.role === 'officer';
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rfq')
      .then(res => setRfqs(res.success && res.data ? res.data : initialMockRFQs))
      .catch(() => setRfqs(initialMockRFQs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Requests for Quotation"
        subtitle="Manage and track all procurement RFQs."
        actions={isOfficer && (
          <Button icon={<Plus size={16} />} onClick={() => navigate('/rfq/new')}>
            Create RFQ
          </Button>
        )}
      />
      <DataTable
        columns={columns}
        data={rfqs}
        loading={loading}
        searchKeys={['title', 'rfq_number']}
        emptyIcon={FileText}
        emptyTitle="No RFQs yet"
        emptyDescription="Create your first Request for Quotation to get started."
        emptyAction={isOfficer && (
          <Button icon={<Plus size={16} />} size="sm" onClick={() => navigate('/rfq/new')}>Create RFQ</Button>
        )}
        onRowClick={row => navigate(`/rfq/${row.id}`)}
      />
    </div>
  );
};

export default RFQList;
