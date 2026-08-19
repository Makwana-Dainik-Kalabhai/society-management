import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Moon, Sun, Search, LogOut, User, Building, Menu, Shield, CheckCheck 
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { markLocalAsRead, markAllLocalRead } from '../../redux/slices/notificationSlice';
import { notificationAPI } from '../../api/allAPIs';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { items: notifications, unreadCount } = useSelector(state => state.notifications);
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      dispatch(markLocalAsRead(id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      dispatch(markAllLocalRead());
      toast.success('All marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const societyName = user?.societyId?.name || (user?.role === 'main_admin' ? 'SocietyHub Global Admin' : 'Emerald Heights Residency');

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Society Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Building size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-tight">
                {societyName}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {user?.role === 'main_admin' ? 'Master Control Panel' : user?.memberDetails?.flatNumber ? `Flat ${user.memberDetails.wing ? user.memberDetails.wing + '-' : ''}${user.memberDetails.flatNumber}` : 'Society Dashboard'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions: Theme, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Announcements & Notices</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 text-xs font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No notifications right now.</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkAsRead(n._id)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                          n.isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{n.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            n.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {n.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(user?.role === 'member' ? '/member/notifications' : '/society/notifications');
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All Notice Board →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <img
                src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'Resident'}`}
                alt="Avatar"
                className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1 space-y-1">
                  {user?.role === 'member' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/member/profile');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User size={15} /> My Flat & Family Profile
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
