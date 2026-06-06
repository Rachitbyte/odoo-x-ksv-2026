import React, { useState, useEffect } from 'react';
import { Clock, FileText, ShoppingCart, Receipt, ArrowUpRight, ArrowDownRight, AlertTriangle, PlusCircle, Users, FilePlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
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
    { "month": "Apr", "amount": 81000 },
    { "month": "May", "amount": 95000 },
    { "month": "Jun", "amount": 110000 }
  ],
  "overdueInvoices": [
    { "id": 1, "invoice_number": "INV-0014", "vendor": "TechSupplies Ltd", "amount": 15000, "days_overdue": 12 },
    { "id": 2, "invoice_number": "INV-0021", "vendor": "Office Mart", "amount": 4500, "days_overdue": 5 },
    { "id": 3, "invoice_number": "INV-0008", "vendor": "BuildRight Co", "amount": 32000, "days_overdue": 18 }
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
          // Merge with mockData so any missing fields don't crash .map() calls
          setData({
            ...mockData,
            ...response.data,
            monthlySpending: response.data.monthlySpending?.length
              ? response.data.monthlySpending
              : mockData.monthlySpending,
            recentRFQs: response.data.recentRFQs ?? mockData.recentRFQs,
            overdueInvoices: response.data.overdueInvoices ?? mockData.overdueInvoices,
          });
        } else {
          setData(mockData);
        }
      } catch (error) {
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
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-2">
        <Link to="/rfq/new" className="btn bg-surface border border-border text-text-primary hover:border-primary hover:text-primary transition-colors flex items-center gap-2 rounded-lg px-4 py-2 shadow-sm">
          <FilePlus size={18} /> New RFQ
        </Link>
        <button className="btn bg-surface border border-border text-text-primary hover:border-primary hover:text-primary transition-colors flex items-center gap-2 rounded-lg px-4 py-2 shadow-sm">
          <Users size={18} /> Add Vendor
        </button>
        <button className="btn bg-surface border border-border text-text-primary hover:border-primary hover:text-primary transition-colors flex items-center gap-2 rounded-lg px-4 py-2 shadow-sm">
          <Receipt size={18} /> New Invoice
        </button>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Approvals" value={data.pendingApprovals ?? data.pendingApprovals} icon={Clock} trend="up" />
        <StatCard title="Active RFQs" value={data.activeRFQs} icon={FileText} trend="up" />
        <StatCard title="POs This Month" value={data.posThisMonth} icon={ShoppingCart} trend="down" />
        <StatCard title="Unpaid Invoices" value={data.unpaidInvoices ?? data.totalInvoices} icon={Receipt} trend="up" />
      </div>

      {/* Row 2: RFQs Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent RFQs Table */}
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

        {/* Monthly Spending Chart (6 months) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-4">Monthly Spending</h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
                <XAxis dataKey="month" stroke="#5A5853" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis 
                  stroke="#5A5853" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  className="font-mono"
                  tickMargin={10}
                />
                <Tooltip 
                  cursor={{ fill: '#E8E4DC', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC', borderRadius: '0.5rem', color: '#1A1917' }}
                  itemStyle={{ color: '#2D4A3E', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#5A5853', marginBottom: '4px' }}
                />
                <Bar dataKey="amount" fill="#2D4A3E" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Overdue Invoices (Replaced Recent Activity) */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <AlertTriangle size={20} className="text-warning" />
          Overdue Invoices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.overdueInvoices.map((inv) => (
            <div key={inv.id} className="bg-background border border-danger/20 rounded-lg p-4 hover:border-danger/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-text-primary font-medium">{inv.invoice_number}</span>
                <span className="text-xs font-medium text-danger bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20">
                  {inv.days_overdue} days late
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-3">{inv.vendor}</p>
              <p className="text-lg font-mono font-bold text-text-primary">
                ₹{inv.amount.toLocaleString()}
              </p>
            </div>
          ))}
          {data.overdueInvoices.length === 0 && (
             <div className="col-span-3 text-center py-8 text-text-secondary">
               No overdue invoices!
             </div>
          )}
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
    open: 'bg-[#2C5F8A]/10 text-[#2C5F8A] border border-[#2C5F8A]/20',
    under_review: 'bg-[#B87333]/10 text-[#B87333] border border-[#B87333]/20',
    approved: 'bg-[#2D4A3E]/10 text-[#2D4A3E] border border-[#2D4A3E]/20',
    rejected: 'bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/20',
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
    <div className="flex gap-4 mb-2">
      <div className="w-24 h-10 bg-surface border border-border rounded-lg"></div>
      <div className="w-24 h-10 bg-surface border border-border rounded-lg"></div>
      <div className="w-24 h-10 bg-surface border border-border rounded-lg"></div>
    </div>
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
  </div>
);

export default Dashboard;
