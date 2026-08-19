import React from 'react';
import { X, Download, CheckCircle, Building, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptModal = ({ isOpen, onClose, payment, society }) => {
  if (!isOpen || !payment) return null;

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem('token');
    try {
      toast.loading('Generating Official PDF Receipt...', { id: 'pdf-dl' });
      // Direct authenticated fetch via blob
      const response = await fetch(`/api/payments/receipt/${payment._id}?token=${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Receipt generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${payment.receiptNumber || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Official PDF Receipt downloaded!', { id: 'pdf-dl', icon: '📄' });
    } catch (err) {
      toast.error('Failed to download receipt PDF', { id: 'pdf-dl' });
    }
  };

  const user = payment.userId || {};
  const maintenance = payment.maintenanceId || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        {/* Header Badge */}
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Payment Receipt</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{payment.receiptNumber || 'REC-2026-XXXX'}</p>
        </div>

        {/* Receipt Content */}
        <div className="py-4 space-y-3.5 text-xs sm:text-sm">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500">Resident Name</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{user.fullName || 'Resident Member'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500">Flat / Unit</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {user.memberDetails?.wing ? `Wing ${user.memberDetails.wing} - Flat ` : ''}{user.memberDetails?.flatNumber || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500">Billing Cycle</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{maintenance.title || 'Society Monthly Maintenance'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500">Payment Date</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {payment.paymentMethod || 'Online UPI'}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{payment.transactionId}</span>
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center mt-2">
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Total Amount Paid</p>
              {payment.penaltyAmount > 0 && (
                <p className="text-[11px] text-slate-500">Includes ₹{payment.penaltyAmount} late fee</p>
              )}
            </div>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ₹{(payment.paidAmount || payment.amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all text-xs sm:text-sm"
          >
            <Download size={16} /> Download Official PDF
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-all text-xs sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
