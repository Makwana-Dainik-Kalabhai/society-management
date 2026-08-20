import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, CreditCard, AlertCircle, Wallet, Plus, ArrowRight, CheckCircle2, Clock, Calendar, Sparkles 
} from 'lucide-react';
import { societyAPI } from '../../api/societyAPI';
import StatCard from '../../components/common/StatCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const SocietyAdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await societyAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.monthlyChart || [
    { month: 'May', collected: 65000 },
    { month: 'Jun', collected: 72000 },
    { month: 'Jul', collected: 78500 },
    { month: 'Aug', collected: 68000 }
  ];

  return (
    <div className="space-y-6">
      {/* Society Hero Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-brand-500/30 border border-brand-400/40 text-brand-200 text-xs font-bold uppercase tracking-wider">
              {user?.societyId?.name || 'Housing Society Portal'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Society Management Desk</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Welcome {user?.fullName || 'Society Secretary'}. Managing society operations, billing collections, and resident helpdesk tickets.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/society/members"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Users size={15} /> Add Resident
            </Link>
            <Link
              to="/society/maintenance"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center gap-1.5"
            >
              <CreditCard size={15} /> Generate Bill
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Residents"
          value={stats?.totalMembers || 0}
          change="Verified Members"
          isPositive={true}
          icon={Users}
          color="indigo"
          subtitle="Registered in complex"
        />
        <StatCard
          title="Maintenance Collected"
          value={`₹${(stats?.totalCollected || 0).toLocaleString('en-IN')}`}
          change="Completed payments"
          isPositive={true}
          icon={CreditCard}
          color="emerald"
          subtitle="Current Collections"
        />
        <StatCard
          title="Open Complaints"
          value={stats?.openComplaints || 0}
          change={`${stats?.resolvedComplaints || 0} resolved`}
          isPositive={true}
          icon={AlertCircle}
          color="amber"
          subtitle="Pending Attention"
        />
        <StatCard
          title="Approved Expenses"
          value={`₹${(stats?.totalExpenses || 0).toLocaleString('en-IN')}`}
          change="Approved Vouchers"
          isPositive={false}
          icon={Wallet}
          color="purple"
          subtitle="Society Expenditures"
        />
      </div>

      {/* Collection Trend & Recent Complaints Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Graph */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Monthly Revenue Collection Progress</h3>
              <p className="text-xs text-slate-500">Maintenance payments received over the last 4 months (INR)</p>
            </div>
            <Link to="/society/payments" className="text-xs font-bold text-brand-600 hover:underline">
              Ledger →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Collections']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSoc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center / Recent Complaints */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Active Resident Tickets</h3>
              <Link to="/society/complaints" className="text-xs font-bold text-brand-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {(stats?.recentComplaints || []).slice(0, 3).map((c) => (
                <Link
                  key={c._id}
                  to={`/society/complaints`}
                  className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-brand-500/50 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{c.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      c.status === 'in_progress' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{c.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>{c.userId?.fullName || 'Resident'}</span>
                    <span>{c.userId?.memberDetails?.flatNumber ? `Flat ${c.userId.memberDetails.wing}-${c.userId.memberDetails.flatNumber}` : ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Scheduled Water Tank Cleaning</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Aug 22</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocietyAdminDashboard;
