import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle, Clock } from 'lucide-react';
import { communityAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const MemberPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleVote = async (pollId, optionIndex) => {
    try {
      await communityAPI.votePoll(pollId, optionIndex);
      toast.success('Your vote has been cast and recorded!', { icon: '🗳️' });
      fetchPolls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voting failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Resident Opinion Polls & Voting</h2>
        <p className="text-xs sm:text-sm text-slate-500">Vote on community proposals, solar upgrades, and society regulations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((p) => (
          <div key={p._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                  {p.totalVotes || 0} Total Votes
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={12} /> Ends {new Date(p.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">{p.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{p.description}</p>

              {/* Voting Options */}
              <div className="space-y-2.5">
                {p.options.map((opt, i) => {
                  const isUserPick = p.hasVoted && p.votedOptionIndex === i;
                  return (
                    <div
                      key={i}
                      onClick={() => !p.hasVoted && handleVote(p._id, i)}
                      className={`p-3 rounded-2xl border transition-all ${
                        p.hasVoted 
                          ? isUserPick 
                            ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40' 
                            : 'border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60' 
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-brand-500 hover:bg-brand-50/30 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {isUserPick && <CheckCircle size={14} className="text-brand-600" />}
                          {opt.text}
                        </span>
                        <span className="text-brand-600 dark:text-brand-400 font-bold">{opt.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${opt.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              {p.hasVoted ? (
                <span className="text-emerald-600 font-bold">✓ You have cast your vote on this poll.</span>
              ) : (
                <span className="text-brand-600 font-bold">Click an option above to cast your vote.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberPolls;
