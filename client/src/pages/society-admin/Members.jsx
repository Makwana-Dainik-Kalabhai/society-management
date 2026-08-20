import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, Plus, Search, Filter, Download, Upload, Edit, Trash2, Phone, Mail, Car, Home, CheckCircle, X, KeyRound, ShieldAlert, Lock, Check, Sparkles 
} from 'lucide-react';
import { userAPI } from '../../api/userAPI';
import { authAPI } from '../../api/authAPI';
import { societyAPI } from '../../api/societyAPI';
import toast from 'react-hot-toast';

const Members = () => {
  const { user } = useSelector(state => state.auth);
  const [members, setMembers] = useState([]);
  const [societyData, setSocietyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedOwnerType, setSelectedOwnerType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [globalPassword, setGlobalPassword] = useState('password123');
  const [editingMember, setEditingMember] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'member',
    memberDetails: {
      flatNumber: '',
      wing: 'A',
      floor: 1,
      occupation: '',
      emergencyContact: '',
      isOwner: true,
      vehicleNumbers: [{ type: '4_wheeler', number: '' }]
    }
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    memberDetails: {
      flatNumber: '',
      wing: 'A',
      floor: 1,
      occupation: '',
      emergencyContact: '',
      isOwner: true,
      vehicleNumbers: [{ type: '4_wheeler', number: '' }]
    }
  });

  useEffect(() => {
    fetchSocietyAndMembers();
  }, [selectedWing, selectedOwnerType]);

  const fetchSocietyAndMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWing !== 'all') params.wing = selectedWing;
      if (selectedOwnerType !== 'all') params.isOwner = selectedOwnerType;

      const [res, meRes] = await Promise.all([
        userAPI.getMembers(params),
        authAPI.getMe()
      ]);
      setMembers(res.data.members || []);
      const currentSoc = meRes.data.society || user?.societyId;
      setSocietyData(currentSoc);
      if (currentSoc?.settings?.defaultResidentPassword) {
        setGlobalPassword(currentSoc.settings.defaultResidentPassword);
      }
    } catch (err) {
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlobalPassword = async (e) => {
    e.preventDefault();
    if (!societyData?._id) return;
    try {
      await societyAPI.updateSociety(societyData._id, {
        settings: {
          ...(societyData.settings || {}),
          defaultResidentPassword: globalPassword
        }
      });
      toast.success('Society global resident password updated successfully!', { icon: '🔑' });
      setShowPasswordModal(false);
      fetchSocietyAndMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update global password');
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        password: formData.password && formData.password.trim() !== ''
          ? formData.password.trim()
          : (societyData?.settings?.defaultResidentPassword || globalPassword || 'password123')
      };
      await userAPI.createMember(payload);
      toast.success('Resident registered successfully! Password set to global default.', { icon: '🎉' });
      setShowAddModal(false);
      fetchSocietyAndMembers();
      setFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        role: 'member',
        memberDetails: {
          flatNumber: '',
          wing: societyData?.wings?.[0]?.name || 'A',
          floor: 1,
          occupation: '',
          emergencyContact: '',
          isOwner: true,
          vehicleNumbers: [{ type: '4_wheeler', number: '' }]
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering member');
    }
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditFormData({
      fullName: member.fullName || '',
      email: member.email || '',
      mobileNumber: member.mobileNumber || '',
      memberDetails: {
        flatNumber: member.memberDetails?.flatNumber || '',
        wing: member.memberDetails?.wing || 'A',
        floor: member.memberDetails?.floor || 1,
        occupation: member.memberDetails?.occupation || '',
        emergencyContact: member.memberDetails?.emergencyContact || '',
        isOwner: member.memberDetails?.isOwner ?? true,
        vehicleNumbers: member.memberDetails?.vehicleNumbers?.length > 0
          ? member.memberDetails.vehicleNumbers
          : [{ type: '4_wheeler', number: '' }]
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      await userAPI.updateMember(editingMember._id, editFormData);
      toast.success('Resident details updated successfully!');
      setShowEditModal(false);
      fetchSocietyAndMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update resident');
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove resident ${name}?`)) return;
    try {
      await userAPI.deleteMember(id);
      toast.success('Resident removed');
      fetchSocietyAndMembers();
    } catch (err) {
      toast.error('Failed to remove resident');
    }
  };

  const handleExportCSV = () => {
    const headers = 'Full Name,Email,Mobile,Wing,Floor,Flat,Owner/Tenant,Vehicles\n';
    const rows = members.map(m => 
      `"${m.fullName}","${m.email}","${m.mobileNumber}","${m.memberDetails?.wing || 'A'}","${m.memberDetails?.floor || 1}","${m.memberDetails?.flatNumber || ''}","${m.memberDetails?.isOwner ? 'Owner' : 'Tenant'}","${m.memberDetails?.vehicleNumbers?.map(v => v.number).join('; ') || 'None'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Society_Residents_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success('Residents CSV exported successfully!', { icon: '📥' });
  };

  // Generate available wings and floors
  const availableWings = societyData?.wings?.map(w => w.name) || ['A', 'B', 'C', 'D'];
  const maxFloors = societyData?.numberOfFloors || societyData?.wings?.[0]?.floors || 10;
  const floorOptions = Array.from({ length: maxFloors }, (_, i) => i + 1);

  const filtered = members.filter(m => 
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mobileNumber?.includes(searchTerm) ||
    m.memberDetails?.flatNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Resident Members Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage apartment owners, tenants, wings & floors allocation, and member login accounts</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/60 transition-all"
            title="Set default password for all new residents"
          >
            <Lock size={15} /> Global Password: <span className="font-mono font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">{globalPassword}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus size={16} /> Add Resident
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by resident name, flat, mobile..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Wings ({availableWings.join(', ')})</option>
            {availableWings.map(w => (
              <option key={w} value={w}>Wing {w}</option>
            ))}
          </select>

          <select
            value={selectedOwnerType}
            onChange={(e) => setSelectedOwnerType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="true">Owners Only</option>
            <option value="false">Tenants Only</option>
          </select>
        </div>
      </div>

      {/* Resident Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Resident & Flat</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Ownership</th>
                <th className="py-3.5 px-4">Family / Vehicles</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {filtered.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fullName}`}
                        alt="Avatar"
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{member.fullName}</p>
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 text-xs">
                          <Home size={12} /> Wing {member.memberDetails?.wing || 'A'} - {member.memberDetails?.flatNumber || 'N/A'} (Floor {member.memberDetails?.floor || 1})
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        <span>+91 {member.mobileNumber}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      member.memberDetails?.isOwner
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {member.memberDetails?.isOwner ? 'Owner' : 'Tenant'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <p>{member.memberDetails?.familyMembers?.length || 0} family members</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Car size={12} /> {member.memberDetails?.vehicleNumbers?.map(v => v.number).join(', ') || 'No vehicles'}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle size={13} /> Active
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors"
                        title="Edit resident basic details"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member._id, member.fullName)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Register New Resident Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateMember} className="space-y-3.5 py-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@gmail.com"
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
                    placeholder="9823456789"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Login Password (Auto-Filled with Global Password)
                  </label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Default: <strong className="font-mono bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded">{globalPassword}</strong>
                  </span>
                </div>
                <input
                  type="password"
                  placeholder={`Leave blank to use society default: ${globalPassword}`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <span className="text-[10px] text-slate-400">
                  ✨ Uses society's global password automatically. No need to type a password every time.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Wing</label>
                  <select
                    value={formData.memberDetails.wing}
                    onChange={(e) => setFormData({
                      ...formData,
                      memberDetails: { ...formData.memberDetails, wing: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {availableWings.map(w => (
                      <option key={w} value={w}>Wing {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Floor</label>
                  <select
                    value={formData.memberDetails.floor}
                    onChange={(e) => setFormData({
                      ...formData,
                      memberDetails: { ...formData.memberDetails, floor: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {floorOptions.map(f => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Flat No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 402"
                    value={formData.memberDetails.flatNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      memberDetails: { ...formData.memberDetails, flatNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ownership</label>
                  <select
                    value={formData.memberDetails.isOwner}
                    onChange={(e) => setFormData({
                      ...formData,
                      memberDetails: { ...formData.memberDetails, isOwner: e.target.value === 'true' }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="true">Owner</option>
                    <option value="false">Tenant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9820011111"
                    value={formData.memberDetails.emergencyContact}
                    onChange={(e) => setFormData({
                      ...formData,
                      memberDetails: { ...formData.memberDetails, emergencyContact: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vehicle Registration No.</label>
                <input
                  type="text"
                  placeholder="e.g. MH-02-AB-1234"
                  value={formData.memberDetails.vehicleNumbers[0]?.number || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    memberDetails: {
                      ...formData.memberDetails,
                      vehicleNumbers: [{ type: '4_wheeler', number: e.target.value }]
                    }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Register Member
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Edit Resident Details</h3>
                <p className="text-xs text-slate-500">{editingMember.fullName}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMember} className="space-y-3.5 py-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.mobileNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Wing</label>
                  <select
                    value={editFormData.memberDetails.wing}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      memberDetails: { ...editFormData.memberDetails, wing: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {availableWings.map(w => (
                      <option key={w} value={w}>Wing {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Floor</label>
                  <select
                    value={editFormData.memberDetails.floor}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      memberDetails: { ...editFormData.memberDetails, floor: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {floorOptions.map(f => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Flat No.</label>
                  <input
                    type="text"
                    required
                    value={editFormData.memberDetails.flatNumber}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      memberDetails: { ...editFormData.memberDetails, flatNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ownership</label>
                  <select
                    value={editFormData.memberDetails.isOwner}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      memberDetails: { ...editFormData.memberDetails, isOwner: e.target.value === 'true' }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="true">Owner</option>
                    <option value="false">Tenant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={editFormData.memberDetails.emergencyContact}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      memberDetails: { ...editFormData.memberDetails, emergencyContact: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vehicle Registration No.</label>
                <input
                  type="text"
                  value={editFormData.memberDetails.vehicleNumbers[0]?.number || ''}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    memberDetails: {
                      ...editFormData.memberDetails,
                      vehicleNumbers: [{ type: '4_wheeler', number: e.target.value }]
                    }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                  Save Changes
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Resident Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Global Resident Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateGlobalPassword} className="space-y-4 py-4 text-xs sm:text-sm">
              <p className="text-xs text-slate-500 leading-relaxed">
                Set a default initial password for all resident accounts in <strong>{societyData?.name || 'your society'}</strong>. When adding residents, they will automatically be assigned this password without having to enter it repeatedly.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Default Resident Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Welcome@123 or password123"
                  value={globalPassword}
                  onChange={(e) => setGlobalPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs">
                <p className="font-semibold flex items-center gap-1 mb-0.5">
                  <Sparkles size={13} /> Time Saver Feature
                </p>
                <p className="text-[11px] opacity-90">
                  New residents can log in with their email and this global password, and change it anytime from their profile.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-md">
                  Save Global Password
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
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

export default Members;
