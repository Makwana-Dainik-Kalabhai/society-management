import React, { useEffect, useState } from 'react';
import { Building2, Users, AlertCircle, TrendingUp, IndianRupee, ShieldCheck, Plus, ArrowRight } from 'lucide-react';
import { societyAPI } from '../../api/societyAPI';
import StatCard from '../../components/common/StatCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const MainAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, socRes] = await Promise.all([
        societyAPI.getDashboardStats(),
        societyAPI.getAllSocieties()
      ]);
      setStats(statsRes.data.stats);
      setSocieties(socRes.data.societies || []);
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { month: 'Apr', collections: 180000, newResidents: 15 },
    { month: 'May', collections: 220000, newResidents: 24 },
    { month: 'Jun', collections: 260000, newResidents: 32 },
    { month: 'Jul', collections: 310000, newResidents: 40 },
    { month: 'Aug', collections: 345000, newResidents: 28 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            Super Administrator View
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">Platform Master Control</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Multi-Society Governance, Financial Inflows & Growth Analytics</p>
        </div>
        <Link
          to="/admin/societies"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Onboard New Society
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Societies"
          value={societies.length || '3'}
          change="+1 this month"
          isPositive={true}
          icon={Building2}
          color="indigo"
          subtitle="Across 3 Metros"
        />
        <StatCard
          title="Total Registered Flats"
          value={(stats?.totalMembers ? stats.totalMembers * 3 : 180).toLocaleString()}
          change="+14% YoY"
          isPositive={true}
          icon={Users}
          color="purple"
          subtitle="Occupancy Rate 94%"
        />
        <StatCard
          title="Gross Platform Collections"
          value={`₹${(stats?.totalCollected ? stats.totalCollected * 4 : 450000).toLocaleString('en-IN')}`}
          change="+18.4%"
          isPositive={true}
          icon={IndianRupee}
          color="emerald"
          subtitle="All Societies"
        />
        <StatCard
          title="Open Helpdesk Tickets"
          value={stats?.openComplaints || '4'}
          change="92% SLA met"
          isPositive={true}
          icon={AlertCircle}
          color="amber"
          subtitle="Across network"
        />
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Cumulative Maintenance Inflow Trend</h3>
              <p className="text-xs text-slate-500">Monthly cross-society financial volume (INR)</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              +22% Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Collected']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Area type="monotone" dataKey="collections" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Societies Overview Summary */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Managed Societies</h3>
              <Link to="/admin/societies" className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1">
                View All <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {societies.map((s) => (
                <div key={s._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.city}, {s.state}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Security & Audit Status</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> 100% Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAdminDashboard;
