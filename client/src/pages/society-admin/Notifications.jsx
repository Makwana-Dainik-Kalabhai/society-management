import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, Trash2, Send, AlertTriangle, Info, Calendar, Sparkles, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    target: 'all',
    targetData: [],
    isPinned: false
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    try {
      await notificationAPI.createNotification(formData);
      toast.success('Announcement broadcasted to all residents!', { icon: '📢' });
      setShowBroadcastModal(false);
      fetchNotices();
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        target: 'all',
        targetData: [],
        isPinned: false
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await notificationAPI.deleteNotification(id);
      toast.success('Notice removed');
      fetchNotices();
    } catch (err) {
      toast.error('Failed to remove notice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Notice Board & Broadcasts</h2>
          <p className="text-xs sm:text-sm text-slate-500">Publish urgent notices, scheduled maintenance alerts, and AGM circulars</p>
        </div>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Broadcast New Notice
        </button>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.map((n) => (
          <div key={n._id} className={`glass-card rounded-3xl p-6 border flex flex-col justify-between relative ${n.isPinned ? 'border-indigo-400 dark:border-indigo-700 ring-1 ring-indigo-400/30' : 'border-slate-200 dark:border-slate-800'}`}>
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

              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-2">{n.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Target: {n.target === 'all' ? 'All Wings (A, B, C)' : n.target}</span>
              <button
                onClick={() => handleDeleteNotice(n._id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                title="Delete notice"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Broadcast Society Announcement</h3>
            
            <form onSubmit={handleCreateBroadcast} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Tank Maintenance on Saturday"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notice Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="general">General Notice</option>
                    <option value="maintenance">Maintenance Alert</option>
                    <option value="event">Event / Festival</option>
                    <option value="emergency">Emergency Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Message Content</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details of the announcement for residents..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pin to Top of Notice Board
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-1.5">
                  <Send size={14} /> Publish Broadcast
                </button>
                <button type="button" onClick={() => setShowBroadcastModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
