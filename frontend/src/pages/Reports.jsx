import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Star, PackageCheck, AlertTriangle, Filter } from 'lucide-react';
import api from '../lib/axios';

const mockMonthlySpending = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 62000 },
  { month: "Mar", amount: 85000 },
  { month: "Apr", amount: 41000 },
  { month: "May", amount: 95000 },
  { month: "Jun", amount: 110000 },
  { month: "Jul", amount: 105000 },
  { month: "Aug", amount: 125000 },
  { month: "Sep", amount: 140000 },
  { month: "Oct", amount: 135000 },
  { month: "Nov", amount: 155000 },
  { month: "Dec", amount: 170000 }
];

const mockVendorPerformance = [
  { id: 1, name: "Infra Supplies", category: "Furniture", orders_fulfilled: 45, total_spend: 350000, avg_rating: 4.8 },
  { id: 2, name: "GlobalIT Corp", category: "IT", orders_fulfilled: 28, total_spend: 210000, avg_rating: 4.2 },
  { id: 3, name: "BuildRight Co", category: "Construction", orders_fulfilled: 12, total_spend: 850000, avg_rating: 4.5 },
  { id: 4, name: "Office Mart", category: "Stationery", orders_fulfilled: 85, total_spend: 42000, avg_rating: 3.9 }
];

const Reports = () => {
  const [spendingData, setSpendingData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      setSpendingData(mockMonthlySpending);
      setVendorData(mockVendorPerformance);
      setLoading(false);
    }, 600);
  }, []);

  const totalYTD = spendingData.reduce((acc, curr) => acc + curr.amount, 0);

  // Apply filters to chart data (mocking the effect)
  const chartData = spendingData.map(d => ({
    ...d,
    amount: (categoryFilter !== 'all' || vendorFilter !== 'all') ? d.amount * 0.4 : d.amount // Mock reduction
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Reports & Analytics</h2>
          <p className="text-sm text-text-secondary">Insights on procurement spending and vendor performance.</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary flex items-center gap-2">
          Export Report
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm lg:col-span-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">YTD Spend</p>
            <p className="text-lg font-bold font-mono text-text-primary">${totalYTD.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm lg:col-span-1">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">Peak Month</p>
            <p className="text-lg font-bold font-mono text-text-primary">Dec</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm lg:col-span-1">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">Active Vendors</p>
            <p className="text-lg font-bold font-mono text-text-primary">{vendorData.length}</p>
          </div>
        </div>

        {/* New KPIs added from PRD */}
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm lg:col-span-1">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <PackageCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">PO Fulfillment</p>
            <p className="text-lg font-bold font-mono text-text-primary">94.2%</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm lg:col-span-1">
          <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">Overdue Invoices</p>
            <p className="text-lg font-bold font-mono text-text-primary">3</p>
          </div>
        </div>
      </div>

      {/* Spending Chart with Filters */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-text-primary">Monthly Procurement Spending (2024)</h3>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                <Filter size={14} />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full !pl-8 !py-1.5 appearance-none bg-background border border-border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="IT">IT & Hardware</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                <Filter size={14} />
              </div>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full !pl-8 !py-1.5 appearance-none bg-background border border-border rounded-md text-sm"
              >
                <option value="all">All Vendors</option>
                <option value="Infra Supplies">Infra Supplies</option>
                <option value="TechCore LTD">TechCore LTD</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[300px] bg-background/50 animate-pulse rounded-lg"></div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3347" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{ fill: '#2E3347', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2E3347', borderRadius: '8px', color: '#F1F5F9' }}
                  itemStyle={{ color: '#4F8EF7', fontWeight: 'bold' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 100000 ? '#4F8EF7' : '#2E3347'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Vendor Performance Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-text-primary">Vendor Performance Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-border text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Vendor Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Orders Fulfilled</th>
                <th className="px-6 py-4 font-medium text-right">Total Spend</th>
                <th className="px-6 py-4 font-medium text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">Loading data...</td>
                </tr>
              ) : (
                vendorData.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-background/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-primary">{vendor.name}</td>
                    <td className="px-6 py-4 text-text-secondary">{vendor.category}</td>
                    <td className="px-6 py-4 text-center font-mono">{vendor.orders_fulfilled}</td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-primary">${vendor.total_spend.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-warning">
                        <Star size={14} className="fill-warning" />
                        <span className="font-medium">{vendor.avg_rating.toFixed(1)}</span>
                      </div>
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

export default Reports;
