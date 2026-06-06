import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Receipt, Printer, FileText } from 'lucide-react';
import api from '../../lib/axios';

const mockPODetail = {
  id: 1, 
  po_number: "PO-2024-0001",
  rfq_title: "Office Laptops Q1 Procurement", 
  vendor_name: "TechSupplies Ltd",
  vendor_address: "123 Tech Park, Silicon Ave",
  vendor_email: "billing@techsupplies.com",
  subtotal: 60000,
  tax_percent: 18,
  tax_amount: 10800,
  total_amount: 70800, 
  status: "generated", 
  created_at: "2024-12-06",
  items: [
    { description: "Office Laptops - Eng Dept", quantity: 50, unit: "pcs", unit_price: 1200, total: 60000 }
  ]
};

const PODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const res = await api.get(`/po/${id}`);
        setPo(res.success ? res.data : mockPODetail);
      } catch {
        setPo(mockPODetail);
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [id]);

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    try {
      // In real app, POST creates the invoice
      await api.post('/invoices', { po_id: id });
      navigate(`/invoices/${id}`); // Assuming 1:1 mapping for mock
    } catch {
      setTimeout(() => navigate(`/invoices/${id}`), 800);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-[600px] bg-surface rounded-xl border border-border max-w-4xl mx-auto"></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary font-mono">{po.po_number}</h2>
            <p className="text-sm text-text-secondary">Official Purchase Order</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn btn-ghost flex items-center gap-2 print:hidden">
            <Printer size={16} /> Print
          </button>
          {po.status !== 'invoice_raised' && (
            <button 
              onClick={handleGenerateInvoice} 
              disabled={generating}
              className="btn btn-primary bg-success hover:bg-green-600 border-none flex items-center gap-2 print:hidden"
            >
              <Receipt size={16} />
              {generating ? 'Processing...' : 'Generate Invoice'}
            </button>
          )}
        </div>
      </div>

      {/* The Printable Area */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-xl shadow-2xl print:shadow-none print:p-0 print:bg-transparent">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">PURCHASE ORDER</h1>
            <p className="text-gray-500 font-mono">{po.po_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600 mb-1">VendorBridge Corp</h2>
            <p className="text-sm text-gray-500">100 Enterprise Way</p>
            <p className="text-sm text-gray-500">Business City, BC 10001</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor Details</h3>
            <p className="font-bold text-gray-900">{po.vendor_name}</p>
            <p className="text-sm text-gray-600 mt-1">{po.vendor_address || 'Address on file'}</p>
            <p className="text-sm text-gray-600">{po.vendor_email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</h3>
              <p className="font-medium text-gray-900">{po.created_at}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">RFQ Ref</h3>
              <p className="font-medium text-gray-900 line-clamp-1">{po.rfq_title}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Terms</h3>
              <p className="font-medium text-gray-900">Net 30</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</h3>
              <p className="font-medium text-gray-900 capitalize">{po.status.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-10">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left">
              <th className="py-3 text-sm font-bold text-gray-900 uppercase">Description</th>
              <th className="py-3 text-sm font-bold text-gray-900 uppercase text-center w-24">Qty</th>
              <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right w-32">Unit Price</th>
              <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="border-b border-gray-200">
            {po.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 text-sm text-gray-800">{item.description}</td>
                <td className="py-4 text-sm text-gray-800 text-center">{item.quantity} {item.unit}</td>
                <td className="py-4 text-sm text-gray-800 font-mono text-right">${item.unit_price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="py-4 text-sm font-bold text-gray-900 font-mono text-right">${item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-mono font-medium text-gray-900">${po.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({po.tax_percent}%)</span>
              <span className="font-mono font-medium text-gray-900">${po.tax_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-800 pt-3 mt-3">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-mono font-bold text-xl text-gray-900">${po.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500 text-center">
          <p>Authorized Signature: ___________________________</p>
          <p className="mt-4">This is a system generated purchase order and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
};

export default PODetail;
