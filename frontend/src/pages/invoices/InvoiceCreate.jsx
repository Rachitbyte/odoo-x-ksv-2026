import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

const InvoiceCreate = () => {
  const { user } = useAuth();
  const isOfficer = user?.role === 'officer';
  const [pos, setPos] = useState([]);
  const [selectedPo, setSelectedPo] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const res = await api.get('/po'); // assume PO list endpoint returns all POs with status
        if (res.success && res.data) {
          // filter POs that are approved/generation eligible and without invoice
          const eligible = res.data.filter(po => po.status === 'generated' && !po.invoice_created);
          setPos(eligible);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (isOfficer) fetchPOs();
  }, [isOfficer]);

  const handleCreate = async () => {
    if (!selectedPo) return;
    setCreating(true);
    try {
      const res = await api.post('/invoices', { po_id: selectedPo });
      if (res.success) {
        setMessage('Invoice generated successfully');
        // remove from list
        setPos(pos.filter(po => po.id !== selectedPo));
        setSelectedPo('');
      } else {
        setMessage(res.message || 'Failed to generate invoice');
      }
    } catch (err) {
      setMessage('Server error while creating invoice');
    } finally {
      setCreating(false);
    }
  };

  if (!isOfficer) {
    return <div className="p-8 text-center text-text-secondary">Unauthorized. Only Procurement Officers can generate invoices.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-text-primary">Generate Invoice</h2>
        <button onClick={() => window.history.back()} className="p-2 rounded-md hover:bg-background text-text-secondary hover:text-text-primary">
          <ArrowLeft size={20} />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse h-40 bg-surface rounded-xl border border-border" />
      ) : (
        <>
          {pos.length === 0 ? (
            <p className="text-text-secondary">No eligible Purchase Orders available for invoicing.</p>
          ) : (
            <div className="space-y-4">
              <label className="block font-medium text-text-primary">Select Purchase Order</label>
              <select
                value={selectedPo}
                onChange={e => setSelectedPo(e.target.value)}
                className="w-full border border-border rounded-md p-2"
              >
                <option value="">-- Choose PO --</option>
                {pos.map(po => (
                  <option key={po.id} value={po.id}>PO #{po.po_number} – {po.vendor_name || 'Vendor'}</option>
                ))}
              </select>

              <button
                onClick={handleCreate}
                disabled={!selectedPo || creating}
                className="btn btn-primary flex items-center gap-2"
              >
                {creating ? (
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Generate Invoice
              </button>
            </div>
          )}
          {message && <p className="mt-4 text-text-primary font-medium">{message}</p>}
        </>
      )}
    </div>
  );
};

export default InvoiceCreate;
