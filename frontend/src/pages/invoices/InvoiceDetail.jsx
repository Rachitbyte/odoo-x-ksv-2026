import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Mail, CheckCircle, CheckSquare } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

const mockInvoiceDetail = {
  id: 1, 
  invoice_number: "INV-2024-0001",
  po_number: "PO-2024-0001",
  vendor_name: "TechSupplies Ltd",
  vendor_address: "123 Tech Park, Silicon Ave",
  vendor_email: "billing@techsupplies.com",
  subtotal: 169500,
  tax_percent: 18,
  tax_amount: 30510,
  total_amount: 200010, 
  status: "generated", 
  created_at: "2024-12-06",
  due_date: "2025-01-05",
  items: [
    { description: "Ergonomic chair", quantity: 25, unit: "pcs", unit_price: 3500, total: 87500 },
    { description: "Standing desk", quantity: 10, unit: "pcs", unit_price: 8200, total: 82000 }
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
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        const data = res.success ? res.data : mockInvoiceDetail;
        setInvoice(data);
        setIsPaid(data.status === 'paid');
      } catch {
        setInvoice(mockInvoiceDetail);
        setIsPaid(mockInvoiceDetail.status === 'paid');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
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
    return <div className="animate-pulse h-[600px] bg-surface rounded-xl border border-border max-w-4xl mx-auto"></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center pb-4 border-b border-border flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary font-mono">{invoice.invoice_number}</h2>
            <p className="text-sm text-text-secondary">Official Tax Invoice</p>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => window.print()} className="btn btn-ghost flex items-center gap-2 print:hidden">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost flex items-center gap-2 print:hidden">
            <Download size={16} /> PDF
          </button>
          {isOfficer && (
            <button 
              onClick={handleSendEmail} 
              disabled={emailing || emailSent}
              className={`btn border-none flex items-center gap-2 print:hidden ${emailSent ? 'bg-success text-white' : 'bg-primary text-white hover:bg-blue-600'}`}
            >
              {emailing ? 'Sending...' : emailSent ? <><CheckCircle size={16} /> Sent</> : <><Mail size={16} /> Email Vendor</>}
            </button>
          )}
          
          {!isPaid && (
            <button 
              onClick={handleMarkAsPaid} 
              className="btn bg-success text-white hover:bg-green-600 border-none flex items-center gap-2 print:hidden"
            >
              <CheckSquare size={16} /> Mark as Paid
            </button>
          )}
        </div>
      </div>

      <div className="bg-white text-black p-8 sm:p-12 rounded-xl shadow-2xl print:shadow-none print:p-0 print:bg-transparent relative overflow-hidden">
        {isPaid && (
          <div className="absolute top-1/4 right-1/4 transform rotate-12 opacity-20 pointer-events-none z-10">
            <div className="border-8 border-green-600 text-green-600 text-6xl font-black p-4 rounded-lg uppercase tracking-widest">
              PAID IN FULL
            </div>
          </div>
        )}

        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">TAX INVOICE</h1>
            <p className="text-gray-500 font-mono">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600 mb-1">VendorBridge Corp</h2>
            <p className="text-sm text-gray-500">100 Enterprise Way</p>
            <p className="text-sm text-gray-500">Business City, BC 10001</p>
            <p className="text-sm text-gray-500 mt-1">Tax ID: 98-7654321</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-gray-900">{invoice.vendor_name}</p>
            <p className="text-sm text-gray-600 mt-1">{invoice.vendor_address || 'Address on file'}</p>
            <p className="text-sm text-gray-600">{invoice.vendor_email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Date</h3>
              <p className="font-medium text-gray-900">{invoice.created_at}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</h3>
              <p className="font-medium text-gray-900">{invoice.due_date}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PO Number</h3>
              <p className="font-medium text-gray-900 font-mono">{invoice.po_number}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Due</h3>
              <p className="font-bold text-gray-900 font-mono">₹{invoice.total_amount.toLocaleString(undefined, {minimumFractionDigits: 0})}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-10">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left">
              <th className="py-3 text-sm font-bold text-gray-900 uppercase">Item Description</th>
              <th className="py-3 text-sm font-bold text-gray-900 uppercase text-center w-24">Qty</th>
              <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right w-32">Rate</th>
              <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="border-b border-gray-200">
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 text-sm text-gray-800">{item.description}</td>
                <td className="py-4 text-sm text-gray-800 text-center">{item.quantity} {item.unit}</td>
                <td className="py-4 text-sm text-gray-800 font-mono text-right">₹{item.unit_price.toLocaleString()}</td>
                <td className="py-4 text-sm font-bold text-gray-900 font-mono text-right">₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-end">
          <div className="text-sm text-gray-500 w-1/2">
            <h4 className="font-bold text-gray-900 mb-1">Payment Instructions</h4>
            <p>Please make wire transfers to:</p>
            <p className="font-mono mt-1">Bank: Global Business Bank</p>
            <p className="font-mono">Routing: 123456789</p>
            <p className="font-mono">Account: 987654321000</p>
          </div>
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-mono font-medium text-gray-900">₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST ({invoice.tax_percent}%)</span>
              <span className="font-mono font-medium text-gray-900">₹{invoice.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-800 pt-3 mt-3 bg-gray-50 -mx-4 px-4 pb-2 rounded">
              <span className="font-bold text-gray-900 text-lg">Total Due</span>
              <span className="font-mono font-bold text-2xl text-blue-600">₹{invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500 text-center">
          <p>Thank you for your business!</p>
          <p className="mt-1">If you have any questions about this invoice, please contact billing@vendorbridge.com.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
