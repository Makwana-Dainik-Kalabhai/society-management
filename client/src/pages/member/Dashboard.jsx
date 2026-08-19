import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  CreditCard, AlertCircle, Bell, Calendar, Home, PhoneCall, Shield, ArrowRight, CheckCircle2, Clock 
} from 'lucide-react';
import { maintenanceAPI, complaintAPI, notificationAPI } from '../../api/allAPIs';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [dues, setDues] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidentData();
  }, [user]);

  const fetchResidentData = async () => {
    try {
      setLoading(true);
      const [dueRes, compRes, notRes] = await Promise.all([
        maintenanceAPI.getMyDues(),
        complaintAPI.getComplaints(),
        notificationAPI.getNotifications()
      ]);
      setDues(dueRes.data);
      setComplaints(compRes.data.complaints || []);
      setNotices(notRes.data.notifications || []);
    } catch (err) {
      console.error('Error fetching resident dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const openComplaintsCount = complaints.filter(c => c.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Resident Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Resident Resident Portal
              </span>
              <span className="text-xs text-slate-300">
                Flat {user?.memberDetails?.wing || 'A'}-{user?.memberDetails?.flatNumber || '402'} ({user?.memberDetails?.isOwner ? 'Owner' : 'Tenant'})
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Hello, {user?.fullName || 'Resident Member'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Welcome to your apartment portal at Emerald Heights Residency.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/member/payments"
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center gap-1.5"
            >
              <CreditCard size={16} /> Pay Maintenance
            </Link>
            <Link
              to="/member/complaints"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            >
              <AlertCircle size={16} /> Raise Ticket
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Maintenance Dues"
          value={dues?.totalAmountDue ? `₹${dues.totalAmountDue.toLocaleString('en-IN')}` : '₹0 (All Clear)'}
          change={dues?.totalPendingBills ? `${dues.totalPendingBills} pending bill` : 'No dues'}
          isPositive={!dues?.totalAmountDue}
          icon={CreditCard}
          color={dues?.totalAmountDue ? 'rose' : 'emerald'}
          subtitle={dues?.totalAmountDue ? 'Due by 10th' : 'Up to date'}
        />
        <StatCard
          title="Active Complaints"
          value={openComplaintsCount}
          change={openComplaintsCount > 0 ? 'Under review' : 'No active tickets'}
          isPositive={openComplaintsCount === 0}
          icon={AlertCircle}
          color="amber"
          subtitle="Avg TAT: 24 hrs"
        />
        <StatCard
          title="Notice Board"
          value={notices.length}
          change="3 urgent circulars"
          isPositive={true}
          icon={Bell}
          color="indigo"
          subtitle="Recent announcements"
        />
        <StatCard
          title="Registered Family & Vehicles"
          value={`${user?.memberDetails?.familyMembers?.length || 2} Members`}
          change={`${user?.memberDetails?.vehicleNumbers?.length || 2} Vehicles`}
          isPositive={true}
          icon={Home}
          color="purple"
          subtitle="Parking Slot P-42"
        />
      </div>

      {/* Dues Alert & Recent Helpdesk Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Payment Quick Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Pending Maintenance Assessments</h3>
                <p className="text-xs text-slate-500">Pay your monthly dues online and receive an instant PDF receipt</p>
              </div>
              <Link to="/member/payments" className="text-xs font-bold text-brand-600 hover:underline">
                Payment History →
              </Link>
            </div>

            {dues?.dues?.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 my-4">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">All Maintenance Cleared!</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Thank you for being a prompt resident of Emerald Heights Residency.</p>
              </div>
            ) : (
              <div className="space-y-3 my-3">
                {dues?.dues?.map((bill) => (
                  <div key={bill._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{bill.title}</span>
                        {bill.isOverdue && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-[10px]">
                            Overdue (+₹{bill.penaltyAmount})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                        ₹{bill.totalPayable.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to="/member/payments"
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        Pay Online
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Security Contacts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-brand-600" />
              <span>Main Gate Security Intercom: <strong>Ext #100 / #101</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall size={14} className="text-brand-600" />
              <span>Secretary Office: <strong>+91 98200 12345</strong></span>
            </div>
          </div>
        </div>

        {/* Recent Tickets Status */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">My Helpdesk Tickets</h3>
              <Link to="/member/complaints" className="text-xs font-bold text-brand-600 hover:underline">
                View All →
              </Link>
            </div>

            {complaints.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No complaints filed.</p>
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 3).map((c) => (
                  <Link
                    key={c._id}
                    to="/member/complaints"
                    className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-brand-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{c.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{c.description}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">{c.ticketNumber}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/member/complaints"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all text-slate-700 dark:text-slate-300"
            >
              <AlertCircle size={14} /> File New Complaint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
