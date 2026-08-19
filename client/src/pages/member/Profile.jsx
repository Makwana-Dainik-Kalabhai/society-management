import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Home, Users, Car, Phone, Mail, Save, Plus, Trash2, Shield } from 'lucide-react';
import { authAPI } from '../../api/authAPI';
import { setUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    memberDetails: {
      flatNumber: user?.memberDetails?.flatNumber || '402',
      wing: user?.memberDetails?.wing || 'A',
      floor: user?.memberDetails?.floor || 4,
      occupation: user?.memberDetails?.occupation || 'Senior Software Architect',
      emergencyContact: user?.memberDetails?.emergencyContact || '+91 98765 00001',
      isOwner: user?.memberDetails?.isOwner !== false,
      familyMembers: user?.memberDetails?.familyMembers || [
        { name: 'Pooja Sharma', relationship: 'Spouse', age: 32, contact: '+91 98765 00002' },
        { name: 'Aarav Sharma', relationship: 'Son', age: 7, contact: 'N/A' }
      ],
      vehicleNumbers: user?.memberDetails?.vehicleNumbers || [
        { type: '4_wheeler', number: 'MH-02-CB-4492' },
        { type: '2_wheeler', number: 'MH-02-EE-8812' }
      ]
    }
  });

  const [loading, setLoading] = useState(false);

  const handleAddFamily = () => {
    setFormData(prev => ({
      ...prev,
      memberDetails: {
        ...prev.memberDetails,
        familyMembers: [...prev.memberDetails.familyMembers, { name: '', relationship: 'Family', age: 18, contact: '' }]
      }
    }));
  };

  const handleRemoveFamily = (index) => {
    setFormData(prev => ({
      ...prev,
      memberDetails: {
        ...prev.memberDetails,
        familyMembers: prev.memberDetails.familyMembers.filter((_, i) => i !== index)
      }
    }));
  };

  const handleFamilyChange = (index, field, value) => {
    const updated = [...formData.memberDetails.familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      memberDetails: { ...prev.memberDetails, familyMembers: updated }
    }));
  };

  const handleAddVehicle = () => {
    setFormData(prev => ({
      ...prev,
      memberDetails: {
        ...prev.memberDetails,
        vehicleNumbers: [...prev.memberDetails.vehicleNumbers, { type: '4_wheeler', number: '' }]
      }
    }));
  };

  const handleRemoveVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      memberDetails: {
        ...prev.memberDetails,
        vehicleNumbers: prev.memberDetails.vehicleNumbers.filter((_, i) => i !== index)
      }
    }));
  };

  const handleVehicleChange = (index, field, value) => {
    const updated = [...formData.memberDetails.vehicleNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      memberDetails: { ...prev.memberDetails, vehicleNumbers: updated }
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      dispatch(setUser(res.data.user));
      toast.success('Resident profile & vehicle details updated!', { icon: '✅' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Flat & Resident Profile</h2>
        <p className="text-xs sm:text-sm text-slate-500">Manage registered apartment occupants, vehicle license plates, and emergency contacts</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="text-brand-600" size={18} />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Primary Resident Info</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Occupation</label>
              <input
                type="text"
                value={formData.memberDetails.occupation}
                onChange={(e) => setFormData({
                  ...formData,
                  memberDetails: { ...formData.memberDetails, occupation: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.memberDetails.emergencyContact}
                onChange={(e) => setFormData({
                  ...formData,
                  memberDetails: { ...formData.memberDetails, emergencyContact: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Flat Details Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Home className="text-brand-600" size={18} />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Apartment Allocation</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Wing</label>
              <input
                type="text"
                disabled
                value={`Wing ${formData.memberDetails.wing}`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 font-bold opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Flat No.</label>
              <input
                type="text"
                disabled
                value={formData.memberDetails.flatNumber}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 font-bold opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <input
                type="text"
                disabled
                value={formData.memberDetails.isOwner ? 'Owner Resident' : 'Tenant'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 font-bold opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Family Members Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="text-brand-600" size={18} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Family Members / Co-Residents</h3>
            </div>
            <button
              type="button"
              onClick={handleAddFamily}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          <div className="space-y-3">
            {formData.memberDetails.familyMembers.map((fm, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fm.name}
                  onChange={(e) => handleFamilyChange(idx, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Spouse)"
                  value={fm.relationship}
                  onChange={(e) => handleFamilyChange(idx, 'relationship', e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={fm.age}
                  onChange={(e) => handleFamilyChange(idx, 'age', Number(e.target.value))}
                  className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFamily(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicles Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Car className="text-brand-600" size={18} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Registered Vehicles & Parking</h3>
            </div>
            <button
              type="button"
              onClick={handleAddVehicle}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Add Vehicle
            </button>
          </div>

          <div className="space-y-3">
            {formData.memberDetails.vehicleNumbers.map((vh, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <select
                  value={vh.type}
                  onChange={(e) => handleVehicleChange(idx, 'type', e.target.value)}
                  className="w-36 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="4_wheeler">4-Wheeler Car</option>
                  <option value="2_wheeler">2-Wheeler Bike</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g. MH-02-CB-4492"
                  value={vh.number}
                  onChange={(e) => handleVehicleChange(idx, 'number', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVehicle(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
          >
            <Save size={16} /> {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
