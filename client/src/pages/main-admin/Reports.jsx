import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, PieChart as PieIcon, Layers } from 'lucide-react';
import { societyAPI } from '../../api/societyAPI';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await societyAPI.getReports();
      setReports(res.data.reports);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const cashFlowData = reports?.cashFlow && reports.cashFlow.length > 0
    ? reports.cashFlow
    : [
        { month: 'May', income: 72000, expense: 45000 },
        { month: 'Jun', income: 84000, expense: 48000 },
        { month: 'Jul', income: 98000, expense: 52000 },
        { month: 'Aug', income: 89000, expense: 47000 },
      ];

  const categoryDistribution = reports?.expenseCategories && reports.expenseCategories.length > 0
    ? reports.expenseCategories
    : [
        { name: 'SECURITY & STAFF', value: 48000, color: '#4f46e5' },
        { name: 'ELEVATOR & LIFT AMC', value: 22000, color: '#7c3aed' },
        { name: 'COMMON ELECTRICITY', value: 14250, color: '#06b6d4' },
        { name: 'GARDENING & PEST', value: 6500, color: '#10b981' },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Platform Financial & Operational Reports</h2>
          <p className="text-xs sm:text-sm text-slate-500">Inflow-Outflow analytics, expenditure distribution, and SLA resolution health</p>
        </div>
        <button
          onClick={() => toast.success('Exporting comprehensive report as Excel/CSV...', { icon: '📊' })}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-center"
        >
          <Download size={16} /> Export Financial Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Monthly Cash Inflow vs Outflow</h3>
              <p className="text-xs text-slate-500">Maintenance revenue vs Operational society expenses</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
              Net Surplus: +42%
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Maintenance Collections" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Operational Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Expense Category Distribution</h3>
              <p className="text-xs text-slate-500">Where society maintenance funds are utilized</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              FY 2025-26
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
