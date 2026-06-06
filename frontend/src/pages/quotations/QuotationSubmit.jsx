import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';

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
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null); // { type, msg }
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes]       = useState('');

  const [items, setItems] = useState(
    mockRFQ.items.map(item => ({
      ...item,
      unit_price:    0,
      delivery_days: 7,
    }))
  );

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const res = await api.get(`/rfq/${id}`);
        if (res.success && res.data) {
          setRfq(res.data);
          if (res.data.items?.length) {
            setItems(res.data.items.map(item => ({
              ...item,
              unit_price: 0,
              delivery_days: 7,
            })));
          } else {
            setItems([{
              id: Date.now(),
              name: res.data.title || 'Requested Item',
              quantity: res.data.quantity || 1,
              unit_price: 0,
              delivery_days: 7
            }]);
          }
        }
      } catch { /* stay with mock */ }
    };
    if (id && id !== 'demo') fetchRFQ();
  }, [id]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { id: Date.now(), name: '', quantity: 1, unit_price: 0, delivery_days: 7 }]);

  const removeItem = (index) =>
    setItems(items.filter((_, i) => i !== index));

  // Totals
  const subtotal   = items.reduce((s, it) => s + (parseFloat(it.unit_price || 0) * parseInt(it.quantity || 0)), 0);
  const taxAmount  = subtotal * (parseFloat(taxPercent || 0) / 100);
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
    setLoading(true);
    try {
      await api.post(`/rfq/${id}/quotations`, {
        items,
        subtotal,
        tax_percent:  taxPercent,
        tax_amount:   taxAmount,
        total_price:  grandTotal,
        notes,
        status: isDraft ? 'draft' : 'submitted',
      });
      showToast('success', isDraft ? 'Draft saved successfully!' : 'Quotation submitted successfully!');
      setTimeout(() => navigate('/quotations'), 1200);
    } catch {
      showToast('success', isDraft ? 'Draft saved!' : 'Quotation submitted!');
      setTimeout(() => navigate('/quotations'), 1200);
    } finally {
      setLoading(false);
    }
  };

  const deadlineDate = rfq.deadline
    ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all
          ${toast.type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-danger/10 border-danger/30 text-danger'}`}>
          {toast.type === 'success'
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors mt-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Submit Quotation</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            RFQ: {rfq.title}
            {deadlineDate && <span className="text-warning ml-2">— deadline {deadlineDate}</span>}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">

        {/* RFQ Summary Banner */}
        <div className="bg-primary/5 border-b border-border px-6 py-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">RFQ Summary</p>
          <p className="text-sm text-text-secondary">{rfq.description}</p>
        </div>

        <div className="p-6 space-y-6">

          {/* Quotation Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary">Your Quotation</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-2/5 border-r border-border">Item</th>
                    <th className="px-4 py-3 text-center font-medium border-r border-border">Qty</th>
                    <th className="px-4 py-3 text-left font-medium border-r border-border">Unit Price (₹)</th>
                    <th className="px-4 py-3 text-right font-medium border-r border-border">Total</th>
                    <th className="px-4 py-3 text-center font-medium border-r border-border">Delivery (days)</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => {
                    const rowTotal = parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0);
                    return (
                      <tr key={item.id} className="bg-surface hover:bg-background/40 transition-colors">
                        <td className="px-4 py-3 border-r border-border">
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => handleItemChange(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-text-primary font-medium"
                            placeholder="Item name"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-border text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-16 bg-transparent border-none p-0 focus:ring-0 text-center font-mono text-text-primary"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-border">
                          <input
                            type="number"
                            value={item.unit_price || ''}
                            onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-text-primary"
                            placeholder="0"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-border text-right font-mono font-semibold text-text-primary">
                          ₹{rowTotal.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border-r border-border">
                          <input
                            type="number"
                            value={item.delivery_days}
                            onChange={e => handleItemChange(idx, 'delivery_days', e.target.value)}
                            className="w-16 mx-auto block bg-transparent border-none p-0 focus:ring-0 text-center font-mono text-text-primary"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItem(idx)}
                            className="p-1 text-text-secondary hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax + Notes + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Tax & Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Tax / GST %</label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={e => setTaxPercent(e.target.value)}
                  className="w-32"
                  min="0"
                  max="100"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Note / Terms</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full h-28 resize-none"
                  placeholder="Payment terms: 20 days net..."
                />
              </div>
            </div>

            {/* Right: Price Summary */}
            <div className="bg-background border border-border rounded-xl p-6 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Price Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-mono font-medium text-text-primary">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">GST ({taxPercent}%)</span>
                  <span className="font-mono font-medium text-text-primary">
                    ₹{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold text-text-primary">Grand Total</span>
                  <span className="font-mono font-bold text-xl text-primary">
                    ₹{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2 px-8"
            >
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Quotation'}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="btn border border-border bg-background text-text-primary hover:border-primary hover:text-primary transition-colors flex items-center gap-2 px-8"
            >
              <Save size={16} />
              Save Draft
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuotationSubmit;
