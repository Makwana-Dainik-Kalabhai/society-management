import React, { useState, useEffect } from 'react';
import { Bell, Pin, CheckCheck, Sparkles, AlertCircle } from 'lucide-react';
import { notificationAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const MemberNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notice board');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All announcements marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Notice Board</h2>
          <p className="text-xs sm:text-sm text-slate-500">Official circulars, emergency announcements, and scheduled maintenance notices</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300 self-start sm:self-center"
        >
          <CheckCheck size={16} /> Mark All Read
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => !n.isRead && handleMarkAsRead(n._id)}
            className={`glass-card rounded-3xl p-6 border flex flex-col justify-between relative transition-all ${
              n.isPinned ? 'border-brand-500/60 ring-1 ring-brand-500/30' : 'border-slate-200 dark:border-slate-800'
            } ${!n.isRead ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''}`}
          >
            {n.isPinned && (
              <span className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md shadow-brand-500/30">
                <Pin size={10} /> PINNED
              </span>
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                  n.priority === 'urgent' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' :
                  n.priority === 'high' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {n.priority} priority
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-600 flex-shrink-0 animate-pulse"></span>}
                {n.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Published by: Society Management</span>
              {n.isRead ? (
                <span className="text-emerald-500 font-semibold text-[11px]">Read</span>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n._id); }}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberNotifications;
