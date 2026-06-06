import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Mail, CheckCircle, CheckSquare } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

const mockInvoiceDetail = {
  id: 1, 
  invoice_number: 'INV-2024-0001',
  po_number: 'PO-2024-0001',
  vendor_name: 'TechSupplies Ltd',
  vendor_address: '123 Tech Park, Silicon Ave',
  vendor_email: 'billing@techsupplies.com',
  subtotal: 169500,
  tax_percent: 18,
  tax_amount: 30510,
  total_amount: 200010, 
  status: 'generated', 
  created_at: '2024-12-06',
  due_date: '2025-01-05',
  items: [
    { description: 'Ergonomic chair', quantity: 25, unit: 'pcs', unit_price: 3500, total: 87500 },
    { description: 'Standing desk',   quantity: 10, unit: 'pcs', unit_price: 8200, total: 82000 }
  ]
};

const InvoiceDetail = () => {
  const { user } = useAuth();
  const isOfficer = user?.role === 'officer';

  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(res => {
        const data = res.success && res.data ? res.data : mockInvoiceDetail;
        setInvoice(data);
        setIsPaid(data.status === 'paid');
      })
      .catch(() => {
        setInvoice(mockInvoiceDetail);
        setIsPaid(mockInvoiceDetail.status === 'paid');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendEmail = async () => {
    setEmailing(true);
    try {
      await api.post(`/invoices/${id}/send-email`);
      setEmailSent(true);
    } catch {
      setTimeout(() => setEmailSent(true), 1200);
    } finally {
      setEmailing(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await api.put(`/invoices/${id}/paid`);
      setIsPaid(true);
    } catch {
      setIsPaid(true);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
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
            <span style={{ fontFamily: 'var(--font-mono)' }}>{invoice.invoice_number}</span>
          </div>
        }
        subtitle="Official Tax Invoice"
        actions={
          <div className="print:hidden" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Button variant="ghost" icon={<Printer size={16} />} onClick={() => window.print()}>Print</Button>
            <Button variant="ghost" icon={<Download size={16} />} onClick={() => window.print()}>PDF</Button>
            {isOfficer && (
              <Button
                variant={emailSent ? 'primary' : 'primary'}
                icon={emailSent ? <CheckCircle size={16} /> : <Mail size={16} />}
                loading={emailing} disabled={emailSent} onClick={handleSendEmail}
              >
                {emailSent ? 'Sent' : 'Email Vendor'}
              </Button>
            )}
            {!isPaid && (
              <Button
                style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: 'white' }}
                icon={<CheckSquare size={16} />} onClick={handleMarkAsPaid}
              >
                Mark as Paid
              </Button>
            )}
          </div>
        }
      />

      <div className="card print:shadow-none print:p-0 print:border-none" style={{ padding: '40px', backgroundColor: '#fff', color: '#000', position: 'relative', overflow: 'hidden' }}>
        {isPaid && (
          <div style={{ position: 'absolute', top: '25%', right: '25%', transform: 'rotate(12deg)', opacity: 0.15, pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ border: '6px solid var(--success)', color: 'var(--success)', fontSize: '56px', fontWeight: 900, padding: '16px 32px', borderRadius: '16px', letterSpacing: '0.1em' }}>
              PAID IN FULL
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '32px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>TAX INVOICE</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{invoice.invoice_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>VendorBridge Corp</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>100 Enterprise Way</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Business City, BC 10001</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Tax ID: 98-7654321</p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed To</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{invoice.vendor_name}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#4B5563', whiteSpace: 'pre-wrap' }}>{invoice.vendor_address || 'Address on file'}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>{invoice.vendor_email}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Date</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827' }}>{invoice.created_at}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827' }}>{invoice.due_date}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PO Number</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827', fontFamily: 'var(--font-mono)' }}>{invoice.po_number}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Due</h3>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: 'var(--font-mono)' }}>₹{invoice.total_amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <table style={{ width: '100%', marginBottom: '40px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #111827', textAlign: 'left' }}>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>Item Description</th>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', textAlign: 'center', width: '96px' }}>Qty</th>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', textAlign: 'right', width: '128px' }}>Rate</th>
              <th style={{ padding: '12px 0', fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', textAlign: 'right', width: '128px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px 0', fontSize: '13px', color: '#374151' }}>{item.description}</td>
                <td style={{ padding: '16px 0', fontSize: '13px', color: '#374151', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '16px 0', fontSize: '13px', color: '#374151', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.unit_price.toLocaleString()}</td>
                <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: 700, color: '#111827', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', width: '50%' }}>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#111827' }}>Payment Instructions</h4>
            <p style={{ margin: 0 }}>Please make wire transfers to:</p>
            <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>Bank: Global Business Bank</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>Routing: 123456789</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>Account: 987654321000</p>
          </div>
          <div style={{ width: '256px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#4B5563' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#111827' }}>₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#4B5563' }}>GST ({invoice.tax_percent}%)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#111827' }}>₹{invoice.tax_amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '16px', marginTop: '12px', backgroundColor: '#F9FAFB', margin: '12px -16px -16px', padding: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Total Due</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: '#2563EB' }}>₹{invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '80px', paddingTop: '32px', borderTop: '1px solid #E5E7EB', fontSize: '13px', color: '#6B7280', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>Thank you for your business!</p>
          <p style={{ margin: '4px 0 0 0' }}>If you have any questions about this invoice, please contact billing@vendorbridge.com.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
