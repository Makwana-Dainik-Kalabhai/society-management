import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, User, Wrench, Sparkles, ChevronDown } from 'lucide-react';
import { authAPI } from '../../api/authAPI';
import { switchDemoUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export const DEMO_ACCOUNTS = [
  {
    role: 'main_admin',
    name: 'Super Admin',
    email: 'admin@societyhub.com',
    desc: 'Platform Multi-Society Portal',
    icon: Shield,
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  },
  {
    role: 'society_admin',
    name: 'Society Admin (Col. Bakshi)',
    email: 'admin@emeraldheights.com',
    desc: 'Emerald Heights Secretary',
    icon: Building2,
    color: 'from-indigo-600 to-purple-600',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
  },
  {
    role: 'member',
    name: 'Resident Member (Rahul Sharma)',
    email: 'rahul.sharma@gmail.com',
    desc: 'Flat A-402 (Owner)',
    icon: User,
    color: 'from-emerald-600 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  },
  {
    role: 'staff',
    name: 'Staff (Suresh Electrician)',
    email: 'suresh.staff@emeraldheights.com',
    desc: 'Maintenance & Repairs',
    icon: Wrench,
    color: 'from-blue-600 to-cyan-600',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  }
];

const DemoBanner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(null);

  const handleQuickLogin = async (account) => {
    setLoadingEmail(account.email);
    try {
      const res = await authAPI.login({
        email: account.email,
        password: 'password123'
      });
      dispatch(switchDemoUser({
        token: res.data.token,
        user: res.data.user
      }));

      toast.success(`Switched role to ${account.name}`, { icon: '✨' });

      if (account.role === 'main_admin') {
        navigate('/admin/dashboard');
      } else if (account.role === 'society_admin' || account.role === 'staff') {
        navigate('/society/dashboard');
      } else {
        navigate('/member/dashboard');
      }
      setIsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login switch failed');
    } finally {
      setLoadingEmail(null);
    }
  };

  const currentRoleAccount = DEMO_ACCOUNTS.find(a => a.role === user?.role) || DEMO_ACCOUNTS[1];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/20 text-white px-4 py-2 relative z-50 text-xs sm:text-sm shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-indigo-200 hidden sm:inline">⚡ Live Interactive Demo</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Active Role:</span>
          <span className="font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center gap-1.5">
            <currentRoleAccount.icon size={13} />
            {user ? `${user.fullName} (${user.role})` : 'Not Logged In'}
          </span>
        </div>

        {/* Quick Switch Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-sm transition-all text-xs"
            >
              <Sparkles size={13} className="text-amber-300 animate-pulse" />
              <span>1-Click Switch Role</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-slate-800 dark:text-slate-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Switch Account</p>
                </div>
                <div className="space-y-1.5 mt-1.5">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    const isActive = user?.email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        onClick={() => handleQuickLogin(acc)}
                        disabled={loadingEmail === acc.email}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-all ${
                          isActive 
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${acc.color} text-white shadow-sm flex-shrink-0`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-xs truncate text-slate-900 dark:text-slate-100">{acc.name}</p>
                            {isActive && <span className="text-[10px] text-emerald-500 font-bold">Active</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{acc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
