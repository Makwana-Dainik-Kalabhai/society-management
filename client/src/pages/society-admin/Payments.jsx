import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Download, Filter, CheckCircle2, User, FileText } from 'lucide-react';
import { paymentAPI, userAPI, maintenanceAPI } from '../../api/allAPIs';
import ReceiptModal from '../../components/common/ReceiptModal';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const [formData, setFormData] = useState({
    userId: '',
    maintenanceId: '',
    paymentMethod: 'cash',
    paidAmount: 3500,
    notes: 'Received at society management office'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, memRes, billRes] = await Promise.all([
        paymentAPI.getAllPayments(),
        userAPI.getMembers(),
        maintenanceAPI.getBills()
      ]);
      setPayments(payRes.data.payments || []);
      setMembers(memRes.data.members || []);
      setBills(billRes.data.maintenance || []);

      if (memRes.data.members?.length > 0) {
        setFormData(prev => ({ ...prev, userId: memRes.data.members[0]._id }));
      }
      if (billRes.data.maintenance?.length > 0) {
        setFormData(prev => ({ ...prev, maintenanceId: billRes.data.maintenance[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load payments ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.recordOffline(formData);
      toast.success('Offline payment recorded & receipt issued!');
      setShowRecordModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const filtered = payments.filter(p =>
    p.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId?.memberDetails?.flatNumber?.includes(searchTerm) ||
    p.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Payments & Receipts Ledger</h2>
          <p className="text-xs sm:text-sm text-slate-500">Track all resident transactions, offline collections, and download official PDF receipts</p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Record Offline Payment
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by resident name, flat, receipt no..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Receipt No.</th>
                <th className="py-3.5 px-4">Resident & Flat</th>
                <th className="py-3.5 px-4">Billing Cycle</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {p.receiptNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{p.userId?.fullName}</p>
                    <p className="text-[11px] text-slate-500">Wing {p.userId?.memberDetails?.wing || 'A'} - {p.userId?.memberDetails?.flatNumber || 'N/A'}</p>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {p.maintenanceId?.title || 'Monthly Maintenance'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                    ₹{(p.paidAmount || p.amount).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setViewingReceipt(p)}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <FileText size={13} /> View / PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Offline Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Record Offline Payment (Cash / Cheque)</h3>
            
            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Resident</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} (Flat {m.memberDetails?.wing}-{m.memberDetails?.flatNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Billing Cycle</label>
                <select
                  value={formData.maintenanceId}
                  onChange={(e) => setFormData({ ...formData, maintenanceId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {bills.map(b => (
                    <option key={b._id} value={b._id}>{b.title} (₹{b.amount})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="cash">Cash in Office</option>
                    <option value="cheque">Bank Cheque</option>
                    <option value="bank_transfer">Direct Bank Transfer / NEFT</option>
                    <option value="upi">QR UPI Direct</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount Collected (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Received cash by Col. Bakshi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Confirm & Issue Receipt
                </button>
                <button type="button" onClick={() => setShowRecordModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Receipt Viewer Modal */}
      {viewingReceipt && (
        <ReceiptModal
          isOpen={!!viewingReceipt}
          onClose={() => setViewingReceipt(null)}
          payment={viewingReceipt}
        />
      )}
    </div>
  );
};

export default Payments;
