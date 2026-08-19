import React, { useState, useEffect } from 'react';
import { Shield, Plus, Mail, Phone, Building2, Check, UserCheck } from 'lucide-react';
import { userAPI } from '../../api/userAPI';
import { societyAPI } from '../../api/societyAPI';
import toast from 'react-hot-toast';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: 'password123',
    societyId: '',
    role: 'society_admin'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [admRes, socRes] = await Promise.all([
        userAPI.getSocietyAdmins(),
        societyAPI.getAllSocieties()
      ]);
      setAdmins(admRes.data.admins || []);
      setSocieties(socRes.data.societies || []);
      if (socRes.data.societies?.length > 0) {
        setFormData(prev => ({ ...prev, societyId: socRes.data.societies[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load society administrators');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createMember(formData);
      toast.success('Society Administrator appointed successfully!');
      setShowModal(false);
      fetchData();
      setFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        password: 'password123',
        societyId: societies[0]?._id || '',
        role: 'society_admin'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error appointing admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Administrators</h2>
          <p className="text-xs sm:text-sm text-slate-500">Appoint and manage secretary credentials across complexes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Appoint Society Secretary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((adm) => (
          <div key={adm._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={adm.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adm.fullName}`}
                  alt="Admin"
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{adm.fullName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold">
                    Society Secretary
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{adm.societyId?.name || 'Assigned Complex'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>{adm.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{adm.mobileNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <UserCheck size={14} /> Full Permissions
              </span>
              <span>Active</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Appoint Society Secretary</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Assign Society</label>
                <select
                  value={formData.societyId}
                  onChange={(e) => setFormData({ ...formData, societyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {societies.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Col. Rajesh Bakshi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@emeraldheights.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9820012345"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Initial Login Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secure password (e.g. password123)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <span className="text-[10px] text-slate-400">Secretary will use this password and their email to sign in</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Appoint Secretary
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
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

export default Admins;
