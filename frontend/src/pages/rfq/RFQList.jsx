import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, ChevronRight, Filter } from 'lucide-react';
import api from '../../lib/axios';

const initialMockRFQs = [
  { id: 1, rfq_number: "RFQ-2024-0001", title: "Office IT Equipment", quantity: 50, unit: "pcs", deadline: "2024-12-15", status: "open", created_at: "2024-12-01" },
  { id: 2, rfq_number: "RFQ-2024-0002", title: "Stationery Supplies Q1", quantity: 1000, unit: "packs", deadline: "2024-12-20", status: "under_review", created_at: "2024-12-05" },
  { id: 3, rfq_number: "RFQ-2024-0003", title: "Warehouse Racking System", quantity: 10, unit: "units", deadline: "2024-11-30", status: "approved", created_at: "2024-11-15" },
  { id: 4, rfq_number: "RFQ-2024-0004", title: "Marketing Event Catering", quantity: 200, unit: "plates", deadline: "2025-01-10", status: "draft", created_at: "2024-12-10" }
];

const RFQList = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        const res = await api.get('/rfq');
        if (res.success && res.data) {
          setRfqs(res.data);
        } else {
          setRfqs(initialMockRFQs);
        }
      } catch (err) {
        setRfqs(initialMockRFQs);
      } finally {
        setLoading(false);
      }
    };
    fetchRfqs();
  }, []);

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'under_review': return 'bg-warning/10 text-warning border-warning/20';
      case 'open': return 'bg-primary/10 text-primary border-primary/20';
      case 'rejected': return 'bg-danger/10 text-danger border-danger/20';
      case 'draft': return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
      default: return 'bg-surface text-text-primary border-border';
    }
  };

  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.rfq_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Requests for Quotation (RFQs)</h2>
        <Link to="/rfq/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create RFQ
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search RFQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
            <Filter size={18} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full !pl-10 appearance-none bg-surface"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-border text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">RFQ Number</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-border rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-border rounded-full w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-border rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredRfqs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-secondary">
                    <FileText size={32} className="mx-auto mb-3 text-border" />
                    <p>No RFQs found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRfqs.map(rfq => (
                  <tr key={rfq.id} className="hover:bg-background/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-text-primary">{rfq.rfq_number}</td>
                    <td className="px-6 py-4 text-text-primary">{rfq.title}</td>
                    <td className="px-6 py-4 text-text-secondary">{rfq.quantity} {rfq.unit}</td>
                    <td className="px-6 py-4 text-text-secondary">{rfq.deadline}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(rfq.status)} capitalize`}>
                        {rfq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/rfq/${rfq.id}`}
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

export default RFQList;
