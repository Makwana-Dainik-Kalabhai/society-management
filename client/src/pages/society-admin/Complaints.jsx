import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, Wrench, MessageSquare, User, Filter, Search, ChevronRight, X, Send 
} from 'lucide-react';
import { complaintAPI } from '../../api/allAPIs';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const Complaints = () => {
  const socket = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [adminRemark, setAdminRemark] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  // Socket listener for real-time ticket messages and updates
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (data) => {
      if (selectedTicket && selectedTicket._id === data.complaintId) {
        setSelectedTicket(prev => ({
          ...prev,
          comments: data.comments
        }));
      }
      setComplaints(prev => prev.map(c => 
        c._id === data.complaintId ? { ...c, comments: data.comments } : c
      ));
    };

    const handleTicketCreated = (newComplaint) => {
      setComplaints(prev => [newComplaint, ...prev]);
    };

    const handleTicketUpdated = (updatedTicket) => {
      if (selectedTicket && selectedTicket._id === updatedTicket._id) {
        setSelectedTicket(updatedTicket);
      }
      setComplaints(prev => prev.map(c => c._id === updatedTicket._id ? updatedTicket : c));
    };

    socket.on('complaint_message_received', handleMessageReceived);
    socket.on('complaint_created', handleTicketCreated);
    socket.on('complaint_updated', handleTicketUpdated);

    return () => {
      socket.off('complaint_message_received', handleMessageReceived);
      socket.off('complaint_created', handleTicketCreated);
      socket.off('complaint_updated', handleTicketUpdated);
    };
  }, [socket, selectedTicket]);

  // Join room when ticket opened
  useEffect(() => {
    if (selectedTicket && socket) {
      socket.emit('join_complaint', selectedTicket._id);
    }
  }, [selectedTicket, socket]);

  useEffect(() => {
    if (selectedTicket) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.comments]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await complaintAPI.getComplaints(params);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (complaint) => {
    setSelectedTicket(complaint);
    setNewStatus(complaint.status);
    setAdminRemark(complaint.adminRemarks || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await complaintAPI.updateStatus(selectedTicket._id, {
        status: newStatus,
        adminRemarks: adminRemark,
        note: `Status set to ${newStatus}. Note: ${adminRemark}`
      });
      toast.success('Ticket updated successfully!');
      setSelectedTicket(res.data.complaint);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;

    const messageToSend = commentText.trim();
    setCommentText('');

    try {
      const res = await complaintAPI.addComment(selectedTicket._id, messageToSend);
      setSelectedTicket(prev => ({
        ...prev,
        comments: res.data.comments
      }));
      if (socket) {
        socket.emit('send_complaint_message', {
          complaintId: selectedTicket._id,
          comments: res.data.comments,
          comment: res.data.comment,
          societyId: selectedTicket.societyId
        });
      }
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Complaints & Helpdesk Desk</h2>
          <p className="text-xs sm:text-sm text-slate-500">Track resident issues, assign staff technicians, and post resolution updates</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            All ({complaints.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            Resolved
          </button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
        >
          <option value="all">All Categories</option>
          <option value="maintenance">Maintenance</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="security">Security</option>
          <option value="noise">Noise</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map((c) => (
          <div
            key={c._id}
            onClick={() => handleOpenDetail(c)}
            className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-brand-500/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">{c.ticketNumber}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  c.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                  c.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-600'
                }`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-1">{c.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.description}</p>
              
              {c.images?.length > 0 && (
                <div className="flex gap-1.5 mb-3 overflow-hidden">
                  {c.images.slice(0, 3).map((img, i) => (
                    <img key={i} src={img} alt="Attachment" className="h-12 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{c.userId?.fullName}</span>
                <span className="text-[11px] text-slate-400">({c.userId?.memberDetails?.wing}-{c.userId?.memberDetails?.flatNumber})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <MessageSquare size={13} />
                <span>{c.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Details & Timeline Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">{selectedTicket.ticketNumber}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">{selectedTicket.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Raised by {selectedTicket.userId?.fullName} (Wing {selectedTicket.userId?.memberDetails?.wing}-{selectedTicket.userId?.memberDetails?.flatNumber}) on {new Date(selectedTicket.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Description & Photos */}
            <div className="py-4 space-y-3.5 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-slate-800 dark:text-slate-200">{selectedTicket.description}</p>
                {selectedTicket.images?.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {selectedTicket.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt="Attachment" className="h-20 w-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <p className="font-bold text-xs text-indigo-700 dark:text-indigo-300">Admin Dispatch & Status Transition</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Action / Resolution Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Technician dispatched / fixed"
                      value={adminRemark}
                      onChange={(e) => setAdminRemark(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">
                  Save Ticket Progress
                </button>
              </form>

              {/* Threaded Live Comments */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Live Chat with Resident ({selectedTicket.comments?.length || 0})
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Real-time active
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                    <p className="text-xs text-center text-slate-400 py-4">No messages yet. Send a message to chat with resident.</p>
                  ) : (
                    selectedTicket.comments.map((com, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">{com.userId?.fullName || 'Resident / Admin'}</span>
                          <span className="text-[10px] text-slate-400">{new Date(com.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{com.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a reply or update to the resident..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20">
                    <Send size={14} /> Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
