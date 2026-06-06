import React, { useState, useEffect } from 'react';
import { Clock, FileText, ShoppingCart, Receipt, ArrowUpRight, ArrowDownRight, Activity as ActivityIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/axios';

const mockData = {
  "pendingApprovals": 4,
  "activeRFQs": 7,
  "posThisMonth": 3,
  "totalInvoices": 12,
  "recentRFQs": [
    { "id": 1, "rfq_number": "RFQ-2024-0001", "title": "Office Supplies", "status": "open", "deadline": "2024-12-30" },
    { "id": 2, "rfq_number": "RFQ-2024-0002", "title": "IT Equipment", "status": "under_review", "deadline": "2024-12-28" },
    { "id": 3, "rfq_number": "RFQ-2024-0003", "title": "Marketing Materials", "status": "approved", "deadline": "2024-12-25" },
    { "id": 4, "rfq_number": "RFQ-2024-0004", "title": "Furniture", "status": "rejected", "deadline": "2024-12-20" }
  ],
  "monthlySpending": [
    { "month": "Jan", "amount": 45000 },
    { "month": "Feb", "amount": 62000 },
    { "month": "Mar", "amount": 54000 },
    { "month": "Apr", "amount": 81000 }
  ],
  "recentActivity": [
    { "id": 1, "action": "RFQ Created", "entity_type": "rfq", "created_at": "2024-12-01T10:00:00Z" },
    { "id": 2, "action": "PO Approved", "entity_type": "po", "created_at": "2024-12-02T14:30:00Z" },
    { "id": 3, "action": "Invoice Paid", "entity_type": "invoice", "created_at": "2024-12-03T09:15:00Z" }
  ]
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setData(mockData);
        }
      } catch (error) {
        // Fallback to mock data silently
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Approvals" value={data.pendingApprovals} icon={Clock} trend="up" />
        <StatCard title="Active RFQs" value={data.activeRFQs} icon={FileText} trend="up" />
        <StatCard title="POs This Month" value={data.posThisMonth} icon={ShoppingCart} trend="down" />
        <StatCard title="Total Invoices" value={data.totalInvoices} icon={Receipt} trend="up" />
      </div>

      {/* Row 2: RFQs Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent RFQs Table (60% -> col-span-3) */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-4">Recent RFQs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-text-secondary text-sm">
                  <th className="pb-3 font-medium">RFQ Number</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRFQs.map((rfq) => (
                  <tr key={rfq.id} className="border-b border-border/50 last:border-0 text-sm hover:bg-background/50 transition-colors">
                    <td className="py-3 font-mono text-text-primary">{rfq.rfq_number}</td>
                    <td className="py-3 text-text-primary font-medium">{rfq.title}</td>
                    <td className="py-3">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="py-3 font-mono text-text-secondary">
                      {new Date(rfq.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Spending Chart (40% -> col-span-2) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-4">Monthly Spending</h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3347" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  className="font-mono"
                  tickMargin={10}
                />
                <Tooltip 
                  cursor={{ fill: '#2E3347', opacity: 0.3 }}
                  contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2E3347', borderRadius: '0.5rem', color: '#F1F5F9' }}
                  itemStyle={{ color: '#4F8EF7', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                />
                <Bar dataKey="amount" fill="#4F8EF7" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity Feed */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <ActivityIcon size={20} className="text-primary" />
          Recent Activity
        </h3>
        <div className="space-y-6 pl-2">
          {data.recentActivity.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4 group">
              {/* Timeline line */}
              {index !== data.recentActivity.length - 1 && (
                <div className="absolute left-1.5 top-6 bottom-[-24px] w-[2px] bg-border group-hover:bg-primary/50 transition-colors"></div>
              )}
              {/* Timeline dot */}
              <div className="relative mt-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface shrink-0 z-10"></div>
              
              <div className="-mt-1">
                <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                <p className="text-xs text-text-secondary mt-1 font-mono">
                  {new Date(activity.created_at).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-surface border border-border rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors duration-300 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon size={22} />
      </div>
      <div className={`p-1 rounded-full ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
        {trend === 'up' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
      </div>
    </div>
    <div>
      <h4 className="text-sm font-medium text-text-secondary mb-1">{title}</h4>
      <p className="text-3xl font-bold text-text-primary font-mono tracking-tight">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    open: 'bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/20',
    under_review: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    approved: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
    rejected: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
  };

  const labels = {
    open: 'Open',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.open}`}>
      {labels[status] || status}
    </span>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-surface border border-border rounded-xl p-6 h-[140px] flex flex-col justify-between">
          <div className="w-10 h-10 bg-border rounded-lg"></div>
          <div>
            <div className="w-24 h-4 bg-border rounded mb-2"></div>
            <div className="w-12 h-8 bg-border rounded"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-6 h-[340px]">
        <div className="w-32 h-6 bg-border rounded mb-6"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between">
              <div className="w-24 h-4 bg-border rounded"></div>
              <div className="w-32 h-4 bg-border rounded"></div>
              <div className="w-20 h-5 bg-border rounded-full"></div>
              <div className="w-24 h-4 bg-border rounded"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 h-[340px]">
        <div className="w-48 h-6 bg-border rounded mb-6"></div>
        <div className="w-full h-56 bg-border rounded flex items-end justify-between px-4 pb-2">
           <div className="w-10 h-32 bg-border/50 rounded-t-sm"></div>
           <div className="w-10 h-48 bg-border/50 rounded-t-sm"></div>
           <div className="w-10 h-40 bg-border/50 rounded-t-sm"></div>
           <div className="w-10 h-56 bg-border/50 rounded-t-sm"></div>
        </div>
      </div>
    </div>
    <div className="bg-surface border border-border rounded-xl p-6 h-[280px]">
      <div className="w-40 h-6 bg-border rounded mb-8"></div>
      <div className="space-y-8 pl-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 relative">
            {i !== 3 && <div className="absolute left-[5px] top-4 bottom-[-32px] w-[2px] bg-border"></div>}
            <div className="w-3 h-3 rounded-full bg-border shrink-0 mt-1"></div>
            <div className="space-y-2">
              <div className="w-40 h-4 bg-border rounded"></div>
              <div className="w-24 h-3 bg-border rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;
