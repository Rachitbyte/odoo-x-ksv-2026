import React, { useState, useEffect } from 'react';
import {
  Clock, FileText, ShoppingCart, Receipt,
  ArrowUpRight, ArrowDownRight, AlertTriangle, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import Badge from '../components/ui/Badge';
import { SkeletonStats } from '../components/ui/LoadingSkeleton';
import { useTheme } from '../context/ThemeContext';

const mockData = {
  pendingApprovals: 4,
  activeRFQs: 7,
  posThisMonth: 3,
  totalInvoices: 12,
  recentRFQs: [
    { id: 1, rfq_number: 'RFQ-2024-0001', title: 'Office Supplies', status: 'open', deadline: '2024-12-30' },
    { id: 2, rfq_number: 'RFQ-2024-0002', title: 'IT Equipment', status: 'under_review', deadline: '2024-12-28' },
    { id: 3, rfq_number: 'RFQ-2024-0003', title: 'Marketing Materials', status: 'approved', deadline: '2024-12-25' },
    { id: 4, rfq_number: 'RFQ-2024-0004', title: 'Furniture', status: 'rejected', deadline: '2024-12-20' },
  ],
  monthlySpending: [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 62000 },
    { month: 'Mar', amount: 54000 },
    { month: 'Apr', amount: 81000 },
    { month: 'May', amount: 95000 },
    { month: 'Jun', amount: 110000 },
  ],
  overdueInvoices: [
    { id: 1, invoice_number: 'INV-0014', vendor: 'TechSupplies Ltd', amount: 15000, days_overdue: 12 },
    { id: 2, invoice_number: 'INV-0021', vendor: 'Office Mart', amount: 4500, days_overdue: 5 },
    { id: 3, invoice_number: 'INV-0008', vendor: 'BuildRight Co', amount: 32000, days_overdue: 18 },
  ],
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.success && response.data) {
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
      } catch {
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartColors = {
    bar:     isDark ? '#4F8A73' : '#2D4A3E',
    grid:    isDark ? '#2C3232' : '#E8E4DC',
    axis:    isDark ? '#808078' : '#6B675F',
    tooltip: isDark ? '#1E2222' : '#FFFFFF',
    border:  isDark ? '#2C3232' : '#E8E4DC',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SkeletonStats count={4} />
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
          <div className="card" style={{ height: '320px' }} />
          <div className="card" style={{ height: '320px' }} />
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Pending Approvals', value: data.pendingApprovals, icon: Clock, trend: 'up', color: 'var(--warning)', link: '/approvals' },
    { title: 'Active RFQs', value: data.activeRFQs, icon: FileText, trend: 'up', color: 'var(--info)', link: '/rfqs' },
    { title: 'POs This Month', value: data.posThisMonth, icon: ShoppingCart, trend: 'down', color: 'var(--purple)', link: '/po' },
    { title: 'Unpaid Invoices', value: data.unpaidInvoices ?? data.totalInvoices, icon: Receipt, trend: 'up', color: 'var(--danger)', link: '/invoices' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 60} />
        ))}
      </div>

      {/* Row 2: Table + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="md:grid-cols-5-2">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {/* Responsive: mobile stacked, desktop side-by-side */}
          <RecentRFQsCard rfqs={data.recentRFQs} />
        </div>
      </div>

      {/* Chart + Table in row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)',
        gap: '16px',
      }}
        className="rfq-chart-row"
      >
        {/* Monthly Spending Chart */}
        <div className="card" style={{ padding: '24px', minWidth: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px', fontWeight: 700,
              color: 'var(--txt)', margin: 0
            }}>
              Monthly Spending
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--txt-2)', marginTop: '2px' }}>
              Procurement spend over the last 6 months
            </p>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={data.monthlySpending} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis
                  dataKey="month" stroke={chartColors.axis}
                  fontSize={12} tickLine={false} axisLine={false}
                  tickMargin={8} fontFamily="var(--font-mono)"
                />
                <YAxis
                  stroke={chartColors.axis} fontSize={11}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${v / 1000}k`}
                  fontFamily="var(--font-mono)" tickMargin={8}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)' }}
                  contentStyle={{
                    backgroundColor: chartColors.tooltip,
                    borderColor: chartColors.border,
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--txt)',
                  }}
                  itemStyle={{ color: chartColors.bar, fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  formatter={v => [`₹${v.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: 'var(--txt-2)', marginBottom: '4px', fontWeight: 500 }}
                />
                <Bar dataKey="amount" fill={chartColors.bar} radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="card" style={{ padding: '24px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              backgroundColor: 'rgba(192,57,43,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={16} color="var(--danger)" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--txt)', margin: 0 }}>
                Overdue Invoices
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.overdueInvoices.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--txt-2)', textAlign: 'center', padding: '24px 0' }}>
                🎉 No overdue invoices!
              </p>
            ) : (
              data.overdueInvoices.map(inv => (
                <div key={inv.id} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(192,57,43,0.15)',
                  backgroundColor: 'rgba(192,57,43,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>
                      {inv.invoice_number}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--txt-2)', marginTop: '2px' }}>
                      {inv.vendor}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--txt)' }}>
                      ₹{inv.amount.toLocaleString()}
                    </div>
                    <span className="badge badge-danger" style={{ fontSize: '11px', marginTop: '4px' }}>
                      {inv.days_overdue}d late
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .rfq-chart-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, trend, color, link, delay = 0 }) => (
  <Link
    to={link}
    className="card animate-fade-in"
    style={{
      display: 'block',
      textDecoration: 'none',
      animationDelay: `${delay}ms`,
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        backgroundColor: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background-color 0.2s',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        color: trend === 'up' ? 'var(--success)' : 'var(--danger)',
        fontSize: '12px', fontWeight: 600,
      }}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
    </div>
    <div style={{ fontSize: '13px', color: 'var(--txt-2)', fontWeight: 500, marginBottom: '6px' }}>
      {title}
    </div>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700,
      color: 'var(--txt)', letterSpacing: '-0.02em', lineHeight: 1,
    }}>
      {value ?? '—'}
    </div>
  </Link>
);

/* ── Recent RFQs Card ─────────────────────────────────────── */
const RecentRFQsCard = ({ rfqs }) => (
  <div className="card" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--txt)', margin: 0 }}>
          Recent RFQs
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--txt-2)', marginTop: '2px' }}>Latest request for quotations</p>
      </div>
      <Link to="/rfqs" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
        View all <TrendingUp size={14} />
      </Link>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>RFQ Number</th>
            <th>Title</th>
            <th>Status</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map(rfq => (
            <tr key={rfq.id}>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--txt)', fontWeight: 500 }}>
                  {rfq.rfq_number}
                </span>
              </td>
              <td style={{ fontWeight: 500, color: 'var(--txt)' }}>{rfq.title}</td>
              <td><Badge status={rfq.status} /></td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--txt-2)' }}>
                  {new Date(rfq.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Dashboard;
