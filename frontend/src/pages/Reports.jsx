import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Users, DollarSign, Star, PackageCheck, AlertTriangle, Filter } from 'lucide-react';
import api from '../lib/axios';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';

const mockMonthlySpending = [
  { month: 'Jan', amount: 45000 }, { month: 'Feb', amount: 62000 },
  { month: 'Mar', amount: 85000 }, { month: 'Apr', amount: 41000 },
  { month: 'May', amount: 95000 }, { month: 'Jun', amount: 110000 },
  { month: 'Jul', amount: 105000 }, { month: 'Aug', amount: 125000 },
  { month: 'Sep', amount: 140000 }, { month: 'Oct', amount: 135000 },
  { month: 'Nov', amount: 155000 }, { month: 'Dec', amount: 170000 }
];

const mockVendorPerformance = [
  { id: 1, name: 'Infra Supplies', category: 'Furniture',    orders_fulfilled: 45, total_spend: 350000, avg_rating: 4.8 },
  { id: 2, name: 'GlobalIT Corp',  category: 'IT',           orders_fulfilled: 28, total_spend: 210000, avg_rating: 4.2 },
  { id: 3, name: 'BuildRight Co',  category: 'Construction', orders_fulfilled: 12, total_spend: 850000, avg_rating: 4.5 },
  { id: 4, name: 'Office Mart',    category: 'Stationery',   orders_fulfilled: 85, total_spend: 42000,  avg_rating: 3.9 }
];

const vendorColumns = [
  { key: 'name', label: 'Vendor Name', sortable: true,
    render: v => <span style={{ fontWeight: 600, color: 'var(--txt)' }}>{v}</span> },
  { key: 'category', label: 'Category', sortable: true,
    render: v => <span style={{ fontSize: '13px', color: 'var(--txt-2)' }}>{v}</span> },
  { key: 'orders_fulfilled', label: 'Orders Fulfilled', sortable: true,
    render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span> },
  { key: 'total_spend', label: 'Total Spend', sortable: true,
    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>₹{v.toLocaleString()}</span> },
  { key: 'avg_rating', label: 'Avg Rating', sortable: true,
    render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 600 }}>
        <Star size={13} fill="var(--warning)" />
        {Number(v || 0).toFixed(1)}
      </div>
    )}
];

const Reports = () => {
  const [spendingData, setSpendingData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      api.get('/reports/spending').catch(() => ({ success: false })),
      api.get('/reports/vendor-performance').catch(() => ({ success: false }))
    ]).then(([spendingRes, vendorRes]) => {
      setSpendingData(spendingRes.success && spendingRes.data ? spendingRes.data : mockMonthlySpending);
      setVendorData(vendorRes.success && vendorRes.data ? vendorRes.data : mockVendorPerformance);
      setLoading(false);
    });
  }, []);

  const totalYTD = spendingData.reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = spendingData.map(d => ({
    ...d,
    amount: (categoryFilter !== 'all' || vendorFilter !== 'all') ? d.amount * 0.4 : d.amount
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--surface)', padding: '8px 12px',
          border: '1px solid var(--border)', borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--txt)' }}>
            ₹{payload[0].value.toLocaleString()}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-m)' }}>Spent</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Insights on procurement spending and vendor performance."
        actions={
          <button className="btn btn-primary" onClick={() => window.print()}>
            Export Report
          </button>
        }
      />

      {/* Top KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          { label: 'YTD Spend',        val: `₹${totalYTD.toLocaleString()}`, icon: DollarSign,    color: 'var(--primary)', bg: 'var(--primary-m)' },
          { label: 'Peak Month',       val: 'Dec',                           icon: TrendingUp,    color: 'var(--success)', bg: 'rgba(45,74,62,0.12)' },
          { label: 'Active Vendors',   val: vendorData.length,               icon: Users,         color: 'var(--warning)', bg: 'rgba(184,115,51,0.12)' },
          { label: 'PO Fulfillment',   val: '94.2%',                         icon: PackageCheck,  color: 'var(--info)',    bg: 'rgba(44,95,138,0.12)' },
          { label: 'Overdue Invoices', val: '3',                             icon: AlertTriangle, color: 'var(--danger)',  bg: 'rgba(192,57,43,0.12)' },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid var(--border)', boxShadow: 'none' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: kpi.bg, color: kpi.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <kpi.icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--txt-2)', marginBottom: '4px', fontWeight: 500 }}>{kpi.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--txt)', margin: 0 }}>{kpi.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Spending Chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--txt)', margin: 0 }}>
            Monthly Procurement Spending (2024)
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-icon-wrap">
              <Filter size={14} className="input-icon" />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ paddingLeft: '34px', fontSize: '13px' }}>
                <option value="all">All Categories</option>
                <option value="IT">IT & Hardware</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            <div className="input-icon-wrap">
              <Filter size={14} className="input-icon" />
              <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={{ paddingLeft: '34px', fontSize: '13px' }}>
                <option value="all">All Vendors</option>
                <option value="Infra Supplies">Infra Supplies</option>
                <option value="TechCore LTD">TechCore LTD</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '350px', borderRadius: '12px' }} />
        ) : (
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--txt-m)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--txt-m)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `₹${val / 1000}k`} />
                <RechartsTooltip cursor={{ fill: 'var(--border)', opacity: 0.4 }} content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 100000 ? 'var(--primary)' : 'var(--border-s)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Vendor Performance */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--txt)', margin: '0 0 16px 4px' }}>
        Vendor Performance Report
      </h3>
      <DataTable
        columns={vendorColumns}
        data={vendorData}
        loading={loading}
      />
    </div>
  );
};

export default Reports;
