import React, { useState, useEffect } from 'react';
import { Activity, User, Clock, FileText, CheckCircle, Package, Receipt, Users, Filter } from 'lucide-react';
import api from '../lib/axios';

const mockLogs = [
  { id: 1, user_name: "Admin User", action: "Created new RFQ", entity_type: "rfq", entity_id: "RFQ-2024-0001", created_at: "2024-12-01 10:30 AM" },
  { id: 2, user_name: "TechSupplies Ltd", action: "Submitted quotation", entity_type: "quotation", entity_id: "Q-101", created_at: "2024-12-05 02:15 PM" },
  { id: 3, user_name: "Manager Sarah", action: "Approved quotation", entity_type: "approval", entity_id: "Q-101", created_at: "2024-12-06 09:00 AM" },
  { id: 4, user_name: "System", action: "Generated Purchase Order", entity_type: "po", entity_id: "PO-2024-0001", created_at: "2024-12-06 09:01 AM" },
  { id: 5, user_name: "System", action: "Generated Invoice", entity_type: "invoices", entity_id: "INV-2024-0001", created_at: "2024-12-06 04:45 PM" },
  { id: 6, user_name: "Admin User", action: "Added new vendor", entity_type: "vendors", entity_id: "V-102", created_at: "2024-12-07 11:20 AM" }
];

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity-logs');
        setLogs(res.success ? res.data : mockLogs);
      } catch {
        setLogs(mockLogs);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getEntityIcon = (type) => {
    switch (type) {
      case 'rfq': 
      case 'quotation': return <FileText size={16} className="text-primary" />;
      case 'approval': return <CheckCircle size={16} className="text-success" />;
      case 'po': return <Package size={16} className="text-blue-400" />;
      case 'invoices': return <Receipt size={16} className="text-purple-400" />;
      case 'vendors': return <Users size={16} className="text-warning" />;
      default: return <Activity size={16} className="text-text-secondary" />;
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.entity_type.includes(filter) || (filter === 'approval' && log.entity_type === 'quotation'));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">System Activity Logs</h2>
          <p className="text-sm text-text-secondary">Comprehensive audit trail of all actions across the platform.</p>
        </div>
        
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
            <Filter size={18} />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full !pl-10 appearance-none bg-surface border border-border rounded-lg text-sm"
          >
            <option value="all">All Activities</option>
            <option value="rfq">RFQs & Quotations</option>
            <option value="approval">Approvals</option>
            <option value="invoices">Invoices & POs</option>
            <option value="vendors">Vendors</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-border shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border rounded w-1/3"></div>
                  <div className="h-3 bg-border rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <Activity size={32} className="mx-auto mb-3 opacity-50" />
            <p>No activity logs match your filter criteria.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative pl-8">
                {/* Timeline Dot */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  {getEntityIcon(log.entity_type)}
                </div>
                
                <div className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                    <p className="font-bold text-text-primary">
                      {log.action} <span className="font-mono font-normal text-text-secondary text-sm ml-1">({log.entity_id})</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-text-secondary font-mono">
                      <Clock size={12} />
                      {log.created_at}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <User size={14} />
                    <span>Performed by: <strong className="text-text-primary">{log.user_name}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
