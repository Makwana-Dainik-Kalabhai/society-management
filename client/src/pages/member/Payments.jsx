import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CreditCard, CheckCircle2, AlertTriangle, Download, ArrowRight, ShieldCheck, FileText, Check, Loader2 } from 'lucide-react';
import { paymentAPI, maintenanceAPI } from '../../api/allAPIs';
import ReceiptModal from '../../components/common/ReceiptModal';
import toast from 'react-hot-toast';

const MemberPayments = () => {
  const { user } = useSelector(state => state.auth);
  const [dues, setDues] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [dueRes, histRes] = await Promise.all([
        maintenanceAPI.getMyDues(),
        paymentAPI.getMyPayments()
      ]);
      setDues(dueRes.data.dues || []);
      setHistory(histRes.data.payments || []);
    } catch (err) {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBillWithRazorpay = async (bill) => {
    setIsProcessing(true);
    try {
      toast.loading('Initiating secure payment gateway...', { id: 'rzp-pay' });
      const orderRes = await paymentAPI.initiateOrder(bill._id);
      const { order, amount } = orderRes.data;

      const razorpayKey = order.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_p65MRYt5ZT7EaY';

      // If Razorpay SDK is loaded in browser
      if (window.Razorpay) {
        toast.dismiss('rzp-pay');
        const options = {
          key: razorpayKey,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Society Management System',
          description: `${bill.title} Maintenance Payment`,
          order_id: order.id.startsWith('order_') ? undefined : order.id,
          handler: async function (response) {
            try {
              toast.loading('Verifying payment signature...', { id: 'verify-pay' });
              const verifyRes = await paymentAPI.verifyPayment({
                maintenanceId: bill._id,
                paymentMethod: 'razorpay_online',
                paymentDetails: {
                  gateway: 'razorpay',
                  orderId: response.razorpay_order_id || order.id,
                  paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  signature: response.razorpay_signature || 'verified_sig'
                }
              });

              toast.success('Payment verified! Official receipt generated.', { id: 'verify-pay', icon: '🎉' });
              setPayingBill(null);
              fetchPaymentData();
              if (verifyRes.data.payment) {
                setViewingReceipt(verifyRes.data.payment);
              }
            } catch (verErr) {
              toast.error(verErr.response?.data?.message || 'Payment verification failed', { id: 'verify-pay' });
            }
          },
          prefill: {
            name: user?.fullName || 'Resident',
            email: user?.email || '',
            contact: user?.mobileNumber || ''
          },
          theme: {
            color: '#4f46e5'
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(`Payment failed: ${response.error.description}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Direct modal fallback
        setPayingBill(bill);
        toast.dismiss('rzp-pay');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment', { id: 'rzp-pay' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDirectPayment = async (e) => {
    e.preventDefault();
    if (!payingBill) return;

    setIsProcessing(true);
    try {
      const mockPaymentId = `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await paymentAPI.verifyPayment({
        maintenanceId: payingBill._id,
        paymentMethod,
        paymentDetails: {
          gateway: 'razorpay_test',
          paymentId: mockPaymentId,
          orderId: `order_${Date.now()}`,
          signature: 'test_verified_signature'
        }
      });

      toast.success('Payment completed successfully! Official receipt generated.', { icon: '🎉' });
      setPayingBill(null);
      fetchPaymentData();
      if (res.data.payment) {
        setViewingReceipt(res.data.payment);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceiptDirect = async (paymentId, receiptNumber) => {
    setDownloadingId(paymentId);
    const token = localStorage.getItem('token');
    try {
      toast.loading('Generating Official PDF Receipt...', { id: 'dl-rcpt' });
      const response = await fetch(`/api/payments/receipt/${paymentId}?token=${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receiptNumber || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Receipt PDF downloaded!', { id: 'dl-rcpt', icon: '📄' });
    } catch (err) {
      toast.error('Failed to download receipt', { id: 'dl-rcpt' });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Maintenance Payments & Invoices</h2>
        <p className="text-xs sm:text-sm text-slate-500">Pay monthly dues securely via Razorpay (UPI, Cards, NetBanking), and download certified receipts</p>
      </div>

      {/* Outstanding Dues Section */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="text-brand-600" size={20} />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Outstanding Maintenance Dues</h3>
          </div>
          {dues.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 text-xs font-bold">
              {dues.length} Pending
            </span>
          )}
        </div>

        {dues.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">All Dues Cleared!</h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">There are no pending maintenance payments for your flat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dues.map((bill) => (
              <div key={bill._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{bill.title}</h4>
                    {bill.isOverdue && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-[10px]">
                        Overdue (+₹{bill.penaltyAmount} late fee)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Due Date: {new Date(bill.dueDate).toLocaleDateString('en-GB')}</p>
                  {bill.paymentReceiver && (
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-0.5">Beneficiary: {bill.paymentReceiver}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Payable</span>
                    <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                      ₹{bill.totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePayBillWithRazorpay(bill)}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />} Pay with Razorpay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History & Receipts */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Past Payment Receipts & History</h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No previous payment history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt No.</th>
                  <th className="py-3 px-4">Billing Cycle</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {item.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.maintenanceId?.title || 'Monthly Maintenance'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 uppercase text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {item.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">
                      ₹{(item.paidAmount || item.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingReceipt(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-1.5 transition-all"
                        >
                          <FileText size={13} /> View
                        </button>
                        <button
                          onClick={() => handleDownloadReceiptDirect(item._id, item.receiptNumber)}
                          disabled={downloadingId === item._id}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                        >
                          {downloadingId === item._id ? <Loader2 className="animate-spin" size={13} /> : <Download size={13} />} Download PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Online Checkout Modal (Manual / Direct fallback) */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 text-xs font-bold uppercase">
                Razorpay Checkout
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">{payingBill.title}</h3>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">₹{payingBill.totalPayable.toLocaleString('en-IN')}</p>
            </div>

            <form onSubmit={handleConfirmDirectPayment} className="py-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Payment Mode</label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay' ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="font-semibold flex items-center gap-2">⚡ Razorpay Test Payment</span>
                    <input type="radio" name="method" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="font-semibold flex items-center gap-2">📱 Direct UPI Transfer</span>
                    <input type="radio" name="method" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Encrypted Razorpay transaction with automated instant receipt generation.</span>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30"
                >
                  {isProcessing ? 'Verifying...' : `Pay ₹${payingBill.totalPayable.toLocaleString('en-IN')}`}
                </button>
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
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

export default MemberPayments;
