import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, Plus, Clock, CheckCircle2, MessageSquare, Send, X, Image as ImageIcon, Sparkles, Upload, Loader2 
} from 'lucide-react';
import { complaintAPI, authAPI } from '../../api/allAPIs';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const MemberComplaints = () => {
  const socket = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const chatBottomRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium',
    images: []
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

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
      // Update in complaints list
      setComplaints(prev => prev.map(c => 
        c._id === data.complaintId ? { ...c, comments: data.comments } : c
      ));
    };

    const handleTicketUpdated = (updatedTicket) => {
      if (selectedTicket && selectedTicket._id === updatedTicket._id) {
        setSelectedTicket(updatedTicket);
      }
      setComplaints(prev => prev.map(c => c._id === updatedTicket._id ? updatedTicket : c));
    };

    socket.on('complaint_message_received', handleMessageReceived);
    socket.on('complaint_updated', handleTicketUpdated);

    return () => {
      socket.off('complaint_message_received', handleMessageReceived);
      socket.off('complaint_updated', handleTicketUpdated);
    };
  }, [socket, selectedTicket]);

  // Join room when ticket selected
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
      const res = await complaintAPI.getComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      toast.error('Failed to load your complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size must be under 10MB');
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await authAPI.uploadFile(uploadData);
      setUploadedImages(prev => [...prev, res.data.fileUrl]);
      toast.success('Image attached successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        images: uploadedImages
      };

      await complaintAPI.createComplaint(payload);
      toast.success('Complaint ticket raised successfully! Society maintenance notified.', { icon: '🎫' });
      setShowAddModal(false);
      fetchComplaints();
      setFormData({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
        images: []
      });
      setUploadedImages([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Helpdesk & Maintenance Complaints</h2>
          <p className="text-xs sm:text-sm text-slate-500">Raise maintenance, plumbing, electrical, or security tickets and track live status</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> File New Complaint
        </button>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-panel rounded-3xl">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-base text-slate-800 dark:text-slate-200">No Complaints Logged</p>
            <p className="text-xs text-slate-500 mt-1">If you have any repair or amenity issue, click above to raise a ticket.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              onClick={() => setSelectedTicket(c)}
              className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-brand-500/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">{c.ticketNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    c.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                    c.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                    'bg-amber-100 dark:bg-amber-950 text-amber-600'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                
                {c.images?.length > 0 && (
                  <div className="flex gap-1.5 mb-3 overflow-hidden">
                    {c.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} alt="Attachment" className="h-12 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    ))}
                    {c.images.length > 3 && (
                      <span className="text-[10px] px-1.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-center text-slate-500">+{c.images.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Category: <strong className="capitalize">{c.category}</strong></span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={13} /> {c.comments?.length || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Details & Real-Time Chat Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">{selectedTicket.ticketNumber}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">{selectedTicket.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  selectedTicket.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                  selectedTicket.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-600'
                }`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">Filed on {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm">
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
                {selectedTicket.adminRemarks && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Society Admin Remarks:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{selectedTicket.adminRemarks}</p>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <p className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">Resolution Timeline</p>
                <div className="space-y-2 border-l-2 border-brand-500 pl-3 ml-2">
                  {selectedTicket.timeline?.map((item, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.status.replace('_', ' ')}: </span>
                      <span className="text-slate-600 dark:text-slate-400">{item.note}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Comments / Chat */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Live Chat with Society Management ({selectedTicket.comments?.length || 0})
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Real-time active
                  </span>
                </div>
                
                <div className="space-y-2.5 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                    <p className="text-xs text-center text-slate-400 py-4">No messages yet. Send a message to start conversation.</p>
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

                <form onSubmit={handleSendComment} className="flex gap-2 pt-2.5">
                  <input
                    type="text"
                    placeholder="Type a message to society office..."
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

      {/* File New Complaint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">File Maintenance / Helpdesk Ticket</h3>
            
            <form onSubmit={handleCreateComplaint} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Low water pressure on 4th floor"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="security">Security & Parking</option>
                    <option value="noise">Noise & Nuisance</option>
                    <option value="cleanliness">Cleanliness</option>
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
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>

              {/* Photo File Attachment from device */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Attach Photos from Device</label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                  {uploadingImage ? (
                    <span className="flex items-center gap-2 text-xs text-brand-600"><Loader2 className="animate-spin" size={16} /> Uploading...</span>
                  ) : (
                    <span className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-600"><Upload size={16} /> Click to browse & upload image</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 mt-2.5 overflow-x-auto">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="Preview" className="h-16 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Submit Complaint
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
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

export default MemberComplaints;
