import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Search, Filter, IndianRupee, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { expenseAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'maintenance',
    amount: '',
    vendorName: '',
    invoiceNumber: '',
    description: '',
    expenseDate: new Date().toISOString().slice(0,10)
  });

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await expenseAPI.getExpenses(params);
      setExpenses(res.data.expenses || []);
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.createExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      toast.success('Expense recorded and approved!');
      setShowAddModal(false);
      fetchExpenses();
      setFormData({
        title: '',
        category: 'maintenance',
        amount: '',
        vendorName: '',
        invoiceNumber: '',
        description: '',
        expenseDate: new Date().toISOString().slice(0,10)
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await expenseAPI.deleteExpense(id);
      toast.success('Expense removed');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Expenditures & Vouchers</h2>
          <p className="text-xs sm:text-sm text-slate-500">Record maintenance vendor bills, security agency salaries, and common area utility expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Log New Expense
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Approved Expenses</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">₹{totalAmount.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">100% auditable vouchers</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Major Category</span>
          <h3 className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">Staff Salaries</h3>
          <p className="text-xs text-slate-500 mt-1">Security & Housekeeping</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{expenses.length}</h3>
          <p className="text-xs text-slate-500 mt-1">Current fiscal cycle</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'salaries', 'electricity', 'maintenance', 'gardening', 'repairs', 'water'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Expense Title & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Vendor & Invoice</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{exp.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{exp.description}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {exp.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <p>{exp.vendorName || 'General Vendor'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{exp.invoiceNumber || 'N/A'}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(exp.expenseDate).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Log Society Expenditure</h3>
            
            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garden Sprinkler Motor Replacement"
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
                    <option value="salaries">Salaries</option>
                    <option value="electricity">Electricity</option>
                    <option value="water">Water Supply</option>
                    <option value="repairs">Repairs & Parts</option>
                    <option value="gardening">Gardening & Landscaping</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vendor / Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Security"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="INV-8821"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Details of repair or replacement..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Approve & Record
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

export default Expenses;
