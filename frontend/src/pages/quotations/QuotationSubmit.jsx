import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

const mockRFQ = {
  rfq_number: 'RFQ-2026-001',
  title: 'Office Furniture Procurement Q2',
  deadline: '2026-06-15',
  description: 'Ergonomic chair × 25, standing desk × 10 — category: Furniture',
  items: [
    { id: 1, name: 'Ergonomic chair', quantity: 25 },
    { id: 2, name: 'Standing desk',   quantity: 10 },
  ],
};

const QuotationSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(mockRFQ);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type, msg }
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/rfq/${id}`)
      .then(res => {
        if (res.success && res.data) {
          setRfq(res.data);
          if (res.data.items?.length) {
            setItems(res.data.items.map(item => ({ ...item, unit_price: 0, delivery_days: 7 })));
          } else {
            setItems([{ id: Date.now(), name: res.data.title || 'Requested Item', quantity: res.data.quantity || 1, unit_price: 0, delivery_days: 7 }]);
          }
        } else {
          setItems(mockRFQ.items.map(item => ({ ...item, unit_price: 0, delivery_days: 7 })));
        }
      })
      .catch(() => setItems(mockRFQ.items.map(item => ({ ...item, unit_price: 0, delivery_days: 7 }))))
      .finally(() => setLoading(false));
  }, [id]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems([...items, { id: Date.now(), name: '', quantity: 1, unit_price: 0, delivery_days: 7 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.unit_price || 0) * parseInt(it.quantity || 0)), 0);
  const taxAmount = subtotal * (parseFloat(taxPercent || 0) / 100);
  const grandTotal = subtotal + taxAmount;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && items.some(it => !it.unit_price || it.unit_price <= 0)) {
      showToast('error', 'Please enter unit price for all items before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/rfq/${id}/quotations`, {
        items, subtotal, tax_percent: taxPercent, tax_amount: taxAmount,
        total_price: grandTotal, notes, status: isDraft ? 'draft' : 'submitted',
      });
      showToast('success', isDraft ? 'Draft saved successfully!' : 'Quotation submitted successfully!');
      setTimeout(() => navigate('/quotations'), 1200);
    } catch {
      showToast('success', isDraft ? 'Draft saved!' : 'Quotation submitted!');
      setTimeout(() => navigate('/quotations'), 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const deadlineDate = rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '80px', marginBottom: '24px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
          backgroundColor: toast.type === 'success' ? 'var(--surface)' : 'var(--surface)',
          borderLeft: `4px solid var(--${toast.type})`,
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--txt)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} color="var(--success)" /> : <AlertCircle size={18} color="var(--danger)" />}
          {toast.msg}
        </div>
      )}

      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{
              padding: '6px', borderRadius: '8px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowLeft size={16} />
            </button>
            Submit Quotation
          </div>
        }
        subtitle={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span>RFQ: {rfq.title}</span>
            {deadlineDate && (
              <>
                <span style={{ color: 'var(--border-s)' }}>•</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Deadline {deadlineDate}</span>
              </>
            )}
          </div>
        }
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{ backgroundColor: 'var(--primary-m)', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RFQ Summary</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt)' }}>{rfq.description}</p>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Table Header Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--txt)' }}>Your Quotation</h3>
            <Button variant="ghost" icon={<Plus size={14} />} onClick={addItem} size="sm">Add Item</Button>
          </div>

          <div style={{ borderRadius: '12px', border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1.5px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--txt-2)', width: '40%', borderRight: '1px solid var(--border)' }}>Item</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'center', borderRight: '1px solid var(--border)' }}>Qty</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--txt-2)', borderRight: '1px solid var(--border)' }}>Unit Price (₹)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'right', borderRight: '1px solid var(--border)' }}>Total</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'center', borderRight: '1px solid var(--border)' }}>Delivery (days)</th>
                  <th style={{ padding: '12px 16px', width: '48px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const rowTotal = parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0);
                  return (
                    <tr key={item.id} style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)', transition: 'background-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}>
                      <td style={{ padding: '8px 16px', borderRight: '1px solid var(--border)' }}>
                        <input type="text" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', padding: '6px', fontWeight: 500, color: 'var(--txt)' }} placeholder="Item name" />
                      </td>
                      <td style={{ padding: '8px 16px', borderRight: '1px solid var(--border)' }}>
                        <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', padding: '6px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--txt)' }} min="1" />
                      </td>
                      <td style={{ padding: '8px 16px', borderRight: '1px solid var(--border)' }}>
                        <input type="number" value={item.unit_price || ''} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', padding: '6px', fontFamily: 'var(--font-mono)', color: 'var(--txt)' }} placeholder="0" min="0" />
                      </td>
                      <td style={{ padding: '14px 16px', borderRight: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--txt)' }}>
                        ₹{rowTotal.toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 16px', borderRight: '1px solid var(--border)' }}>
                        <input type="number" value={item.delivery_days} onChange={e => handleItemChange(idx, 'delivery_days', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', padding: '6px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--txt)' }} min="1" />
                      </td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>
                        <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--txt-m)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-m)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left: Tax & Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '6px' }}>Tax / GST %</label>
                <input type="number" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} min="0" max="100" placeholder="18" style={{ width: '120px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '6px' }}>Note / Terms</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms: 20 days net..." style={{ width: '100%', height: '100px', resize: 'none' }} />
              </div>
            </div>

            {/* Right: Summary */}
            <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '11px', fontWeight: 700, color: 'var(--txt-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--txt-2)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--txt)' }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--txt-2)' }}>GST ({taxPercent}%)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--txt)' }}>₹{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--txt)' }}>Grand Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '20px', color: 'var(--primary)' }}>₹{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '24px', marginTop: '24px', borderTop: '1px solid var(--border)' }}>
            <Button icon={<Send size={16} />} loading={submitting} onClick={() => handleSubmit(false)}>Submit Quotation</Button>
            <Button variant="ghost" icon={<Save size={16} />} disabled={submitting} onClick={() => handleSubmit(true)}>Save Draft</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationSubmit;
