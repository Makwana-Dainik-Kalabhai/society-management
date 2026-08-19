import React, { useState, useEffect } from 'react';
import { Vote, Plus, CheckCircle, BarChart2, Calendar, Users, X } from 'lucide-react';
import { communityAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    expiresAt: ''
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await communityAPI.getPolls();
      setPolls(res.data.polls || []);
    } catch (err) {
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    try {
      const validOptions = formData.options.filter(o => o.trim());
      if (validOptions.length < 2) {
        return toast.error('Please provide at least 2 options');
      }

      await communityAPI.createPoll({
        title: formData.title,
        description: formData.description,
        options: validOptions,
        expiresAt: formData.expiresAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });

      toast.success('Resident poll launched successfully!');
      setShowAddModal(false);
      fetchPolls();
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        expiresAt: ''
      });
    } catch (err) {
      toast.error('Failed to create poll');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Resident Opinion Polls & Voting</h2>
          <p className="text-xs sm:text-sm text-slate-500">Democratize society decisions, clubhouse timings, and capital upgrade approvals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Create New Poll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((p) => (
          <div key={p._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                  {p.totalVotes || 0} Total Votes
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Ends: {new Date(p.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">{p.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{p.description}</p>

              {/* Options Breakdown */}
              <div className="space-y-2.5">
                {p.options.map((opt, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800 dark:text-slate-200">{opt.text}</span>
                      <span className="text-brand-600 dark:text-brand-400 font-bold">{opt.percentage}% ({opt.votesCount})</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${opt.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Status: <strong className="text-emerald-600">Active Voting</strong></span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Create Society Opinion Poll</h3>
            
            <form onSubmit={handleCreatePoll} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Poll Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Should we install EV Chargers in B-Wing?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Context / Budget Details</label>
                <textarea
                  rows="2"
                  placeholder="Estimated cost and benefits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Options</label>
                  <button type="button" onClick={handleAddOption} className="text-xs text-brand-600 font-bold hover:underline">
                    + Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Launch Poll
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

export default Polls;
