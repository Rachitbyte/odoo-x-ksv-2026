import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Printer } from 'lucide-react';
import api from '../../lib/axios';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const mockPODetail = {
  id: 1, 
  po_number: 'PO-2024-0001',
  rfq_title: 'Office Laptops Q1 Procurement', 
  vendor_name: 'TechSupplies Ltd',
  vendor_address: '123 Tech Park, Silicon Ave\nBusiness City, BC 10001',
  vendor_email: 'billing@techsupplies.com',
  subtotal: 60000,
  tax_percent: 18,
  tax_amount: 10800,
  total_amount: 70800, 
  status: 'generated', 
  created_at: '2024-12-06',
  items: [
    { description: 'Office Laptops - Eng Dept', quantity: 50, unit: 'pcs', unit_price: 1200, total: 60000 }
  ]
};

const PODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get(`/po/${id}`)
      .then(res => setPo(res.success && res.data ? res.data : mockPODetail))
      .catch(() => setPo(mockPODetail))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    try {
      await api.post('/invoices', { po_id: id });
      navigate(`/invoices/${id}`);
    } catch {
      setTimeout(() => navigate(`/invoices/${id}`), 800);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '80px', marginBottom: '24px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{
              padding: '6px', borderRadius: '8px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{po.po_number}</span>
          </div>
        }
        subtitle="Official Purchase Order"
        actions={
          <div className="print:hidden" style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" icon={<Printer size={16} />} onClick={() => window.print()}>
              Print
            </Button>
            {po.status !== 'invoice_raised' && (
              <Button icon={<Receipt size={16} />} loading={generating} onClick={handleGenerateInvoice}>
                Generate Invoice
              </Button>
            )}
          </div>
        }
      />

      {/* Printable Area */}
      <div className="card print:shadow-none print:p-0 print:border-none" style={{ padding: '40px', backgroundColor: '#fff', color: '#000' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '32px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>PURCHASE ORDER</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{po.po_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>VendorBridge Corp</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>100 Enterprise Way</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Business City, BC 10001</p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor Details</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{po.vendor_name}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#4B5563', whiteSpace: 'pre-wrap' }}>{po.vendor_address || 'Address on file'}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>{po.vendor_email}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827' }}>{po.created_at}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RFQ Ref</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.rfq_title}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terms</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827' }}>Net 30</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827', textTransform: 'capitalize' }}>{po.status.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', marginBottom: '40px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #111827', textAlign: 'left' }}>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>Description</th>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', textAlign: 'center', width: '96px' }}>Qty</th>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', textAlign: 'right', width: '128px' }}>Unit Price</th>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', textAlign: 'right', width: '128px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px 0', fontSize: '13px', color: '#374151' }}>{item.description}</td>
                <td style={{ padding: '16px 0', fontSize: '13px', color: '#374151', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '16px 0', fontSize: '13px', color: '#374151', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: 700, color: '#111827', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '256px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#4B5563' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#111827' }}>₹{po.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#4B5563' }}>Tax ({po.tax_percent}%)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#111827' }}>₹{po.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '12px', marginTop: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#111827' }}>₹{po.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #E5E7EB', fontSize: '13px', color: '#6B7280', textAlign: 'center' }}>
          <p>Authorized Signature: ___________________________</p>
          <p style={{ marginTop: '16px' }}>This is a system generated purchase order and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
};

export default PODetail;
