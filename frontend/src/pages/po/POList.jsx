import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, FileText, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';

const mockPOs = [
  { id: 1, po_number: "PO-2024-0001", rfq_title: "Office Laptops Q1 Procurement", vendor_name: "TechSupplies Ltd", total_amount: 70800, status: "generated", created_at: "2024-12-06" },
  { id: 2, po_number: "PO-2024-0002", rfq_title: "Warehouse Racking System", vendor_name: "BuildRight Co", total_amount: 17700, status: "invoice_raised", created_at: "2024-12-09" }
];

const POList = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const res = await api.get('/po');
        if (res.success && res.data) setPos(res.data);
        else setPos(mockPOs);
      } catch (err) {
        setPos(mockPOs);
      } finally {
        setLoading(false);
      }
    };
    fetchPOs();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'generated': return 'bg-primary/10 text-primary border-primary/20';
      case 'invoice_raised': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-surface text-text-primary border-border';
    }
  };

  const filteredPOs = pos.filter(po => 
    po.po_number.toLowerCase().includes(search.toLowerCase()) || 
    po.vendor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Purchase Orders</h2>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search by PO number or vendor..."
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
                <th className="px-6 py-4 font-medium">PO Number</th>
                <th className="px-6 py-4 font-medium">RFQ Reference</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Total Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-border rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-border rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-secondary">
                    <ShoppingCart size={32} className="mx-auto mb-3 text-border" />
                    <p>No Purchase Orders found.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-background/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-text-primary">{po.po_number}</td>
                    <td className="px-6 py-4 text-text-secondary">{po.rfq_title}</td>
                    <td className="px-6 py-4 text-text-primary">{po.vendor_name}</td>
                    <td className="px-6 py-4 font-mono text-text-primary font-medium">${po.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(po.status)} capitalize`}>
                        {po.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/po/${po.id}`}
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

export default POList;
