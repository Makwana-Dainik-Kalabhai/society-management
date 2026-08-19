import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertCircle,
  CreditCard,
  Receipt,
  Wallet,
  Bell,
  Calendar,
  Vote,
  FileText,
  Shield,
  BarChart3,
  User,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector(state => state.auth);
  const role = user?.role || 'member';

  const mainAdminNav = [
    { name: 'Platform Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Societies Directory', path: '/admin/societies', icon: Building2 },
    { name: 'Society Admins', path: '/admin/admins', icon: Shield },
    { name: 'Financial & Growth Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const societyAdminNav = [
    { name: 'Dashboard', path: '/society/dashboard', icon: LayoutDashboard },
    { name: 'Resident Directory', path: '/society/members', icon: Users },
    { name: 'Complaints Desk', path: '/society/complaints', icon: AlertCircle },
    { name: 'Maintenance Billings', path: '/society/maintenance', icon: CreditCard },
    { name: 'Payments & Receipts', path: '/society/payments', icon: Receipt },
    { name: 'Society Expenses', path: '/society/expenses', icon: Wallet },
    { name: 'Notice Board', path: '/society/notifications', icon: Bell },
    { name: 'Events & RSVP', path: '/society/events', icon: Calendar },
    { name: 'Resident Polls', path: '/society/polls', icon: Vote },
    { name: 'Society Documents', path: '/society/documents', icon: FileText },
  ];

  const memberNav = [
    { name: 'My Flat Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { name: 'Pay Maintenance', path: '/member/payments', icon: CreditCard },
    { name: 'Complaints & Tickets', path: '/member/complaints', icon: AlertCircle },
    { name: 'Society Notices', path: '/member/notifications', icon: Bell },
    { name: 'Community Events', path: '/member/events', icon: Calendar },
    { name: 'Resident Polls', path: '/member/polls', icon: Vote },
    { name: 'Bylaws & Documents', path: '/member/documents', icon: FileText },
    { name: 'Flat & Family Profile', path: '/member/profile', icon: User },
  ];

  const navItems = role === 'main_admin' 
    ? mainAdminNav 
    : role === 'society_admin' 
      ? societyAdminNav 
      : memberNav;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                SocietyHub
              </span>
              <span className="text-[10px] block font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                {role === 'main_admin' ? 'Master Admin' : role === 'society_admin' ? 'Secretary' : 'Resident Portal'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'Resident'}`}
              alt="Avatar"
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                {user?.fullName || 'Resident User'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.memberDetails?.flatNumber ? `Flat ${user.memberDetails.wing}-${user.memberDetails.flatNumber}` : user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
