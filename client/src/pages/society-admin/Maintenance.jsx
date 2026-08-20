import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, AlertTriangle, CheckCircle, Calendar, Users, IndianRupee, ArrowRight, X } from 'lucide-react';
import { maintenanceAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const [bills, setBills] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [activeTab, setActiveTab] = useState('cycles'); // 'cycles' or 'defaulters'
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    title: '',
    amount: 3500,
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().slice(0,10),
    penaltyAmount: 150,
    paymentReceiver: '',
    paymentUpiId: '',
    description: 'Monthly common maintenance assessment'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, dRes] = await Promise.all([
        maintenanceAPI.getBills(),
        maintenanceAPI.getDefaulters()
      ]);
      setBills(bRes.data.maintenance || []);
      setDefaulters(dRes.data.defaulters || []);
    } catch (err) {
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      await maintenanceAPI.createBill({
        ...formData,
        title: formData.title || `Maintenance Billing for ${formData.month}/${formData.year}`
      });
      toast.success('Monthly maintenance bill batch generated successfully!');
      setShowGenerateModal(false);
      fetchData();
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        title: '',
        amount: 3500,
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().slice(0,10),
        penaltyAmount: 150,
        paymentReceiver: '',
        paymentUpiId: '',
        description: 'Monthly common maintenance assessment'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate billing');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Maintenance & Billing Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">Generate monthly maintenance assessment, set Razorpay beneficiaries, and track defaulters</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Generate Monthly Bill Batch
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-1 max-w-sm border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('cycles')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'cycles' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Billing Cycles ({bills.length})
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'defaulters' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Defaulters List ({defaulters.length})
        </button>
      </div>

      {activeTab === 'cycles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((b) => (
            <div key={b._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold">
                    {monthNames[b.month - 1]} {b.year}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">Due: {new Date(b.dueDate).toLocaleDateString()}</span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{b.title}</h3>
                <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">₹{b.amount.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-400">/ flat</span></p>

                {b.paymentReceiver && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Beneficiary: <strong className="text-slate-800 dark:text-slate-200">{b.paymentReceiver}</strong>
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Paid: {b.paidCount} / {b.totalFlats || 60} flats</span>
                    <span className="text-emerald-600 font-bold">{Math.round((b.paidCount / (b.totalFlats || 60)) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((b.paidCount / (b.totalFlats || 60)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Total Collected:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹{(b.collectedAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Defaulter Resident</th>
                  <th className="py-3.5 px-4">Flat / Wing</th>
                  <th className="py-3.5 px-4">Unpaid Cycles</th>
                  <th className="py-3.5 px-4">Base Due</th>
                  <th className="py-3.5 px-4">Late Penalty</th>
                  <th className="py-3.5 px-4 text-right">Total Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
                {defaulters.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{d.member?.fullName}</p>
                      <p className="text-xs text-slate-500">{d.member?.email} | +91 {d.member?.mobileNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Wing {d.member?.memberDetails?.wing || 'A'} - {d.member?.memberDetails?.flatNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-xs">
                        {d.unpaidCyclesCount} months overdue
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      ₹{d.totalBaseDue?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-600">
                      +₹{d.totalPenalty?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600 text-sm">
                      ₹{d.totalPayable?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Generate Monthly Billing Batch</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleGenerateBill} className="space-y-3.5 py-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {monthNames.map((name, i) => (
                      <option key={i+1} value={i+1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Monthly Amount Per Flat (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Late Penalty (₹)</label>
                  <input
                    type="number"
                    value={formData.penaltyAmount}
                    onChange={(e) => setFormData({ ...formData, penaltyAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Razorpay Payment Receiver / Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emerald Heights Society Maintenance A/C"
                  value={formData.paymentReceiver}
                  onChange={(e) => setFormData({ ...formData, paymentReceiver: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Receiver UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. emeraldheights@icici"
                  value={formData.paymentUpiId}
                  onChange={(e) => setFormData({ ...formData, paymentUpiId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Generate All Bills
                </button>
                <button type="button" onClick={() => setShowGenerateModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
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

export default Maintenance;
