import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Search, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';

const mockInvoices = [
  { id: 1, invoice_number: "INV-2024-0001", po_number: "PO-2024-0001", vendor_name: "TechSupplies Ltd", amount_due: 70800, status: "paid", created_at: "2024-12-06" },
  { id: 2, invoice_number: "INV-2024-0002", po_number: "PO-2024-0002", vendor_name: "BuildRight Co", amount_due: 17700, status: "generated", created_at: "2024-12-10" }
];

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/invoices');
        if (res.success && res.data) setInvoices(res.data);
        else setInvoices(mockInvoices);
      } catch (err) {
        setInvoices(mockInvoices);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'generated': return 'bg-primary/10 text-primary border-primary/20';
      case 'sent': return 'bg-warning/10 text-warning border-warning/20';
      case 'paid': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-surface text-text-primary border-border';
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
    inv.vendor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Invoices</h2>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search by Invoice # or Vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full !pl-10"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-border text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice Number</th>
                <th className="px-6 py-4 font-medium">PO Reference</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Amount Due</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-border rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-border rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-secondary">
                    <Receipt size={32} className="mx-auto mb-3 text-border" />
                    <p>No Invoices found.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-background/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-text-primary">{inv.invoice_number}</td>
                    <td className="px-6 py-4 font-mono text-text-secondary">{inv.po_number}</td>
                    <td className="px-6 py-4 text-text-primary">{inv.vendor_name}</td>
                    <td className="px-6 py-4 font-mono text-text-primary font-medium">${inv.amount_due.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(inv.status)} capitalize`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/invoices/${inv.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
