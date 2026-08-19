import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, MapPin, Mail, Phone, Edit, Check, X, Shield, Layers, LayoutGrid, DollarSign } from 'lucide-react';
import { societyAPI } from '../../api/societyAPI';
import toast from 'react-hot-toast';

const Societies = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSociety, setEditingSociety] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactEmail: '',
    contactPhone: '',
    numberOfWings: 4,
    numberOfFloors: 10,
    paymentReceiverName: '',
    settings: {
      maintenanceDeadline: 10,
      defaultMonthlyMaintenance: 3500,
      penaltyRate: 150
    }
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactEmail: '',
    contactPhone: '',
    numberOfWings: 4,
    numberOfFloors: 10,
    paymentReceiverName: '',
    settings: {
      maintenanceDeadline: 10,
      defaultMonthlyMaintenance: 3500,
      penaltyRate: 150
    }
  });

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const res = await societyAPI.getAllSocieties();
      setSocieties(res.data.societies || []);
    } catch (err) {
      toast.error('Failed to load societies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    try {
      // Generate wings structure
      const wingLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const numWings = Number(formData.numberOfWings) || 4;
      const numFloors = Number(formData.numberOfFloors) || 10;
      
      const wings = [];
      for (let i = 0; i < Math.min(numWings, wingLetters.length); i++) {
        wings.push({
          name: wingLetters[i],
          floors: numFloors,
          totalFlats: numFloors * 4
        });
      }

      const payload = {
        ...formData,
        numberOfWings: numWings,
        numberOfFloors: numFloors,
        wings
      };

      await societyAPI.createSociety(payload);
      toast.success('New Society onboarded successfully!');
      setShowModal(false);
      fetchSocieties();
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contactEmail: '',
        contactPhone: '',
        numberOfWings: 4,
        numberOfFloors: 10,
        paymentReceiverName: '',
        settings: {
          maintenanceDeadline: 10,
          defaultMonthlyMaintenance: 3500,
          penaltyRate: 150
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating society');
    }
  };

  const handleOpenEdit = (society) => {
    setEditingSociety(society);
    setEditFormData({
      name: society.name || '',
      address: society.address || '',
      city: society.city || '',
      state: society.state || '',
      pincode: society.pincode || '',
      contactEmail: society.contactEmail || '',
      contactPhone: society.contactPhone || '',
      numberOfWings: society.numberOfWings || society.wings?.length || 4,
      numberOfFloors: society.numberOfFloors || 10,
      paymentReceiverName: society.paymentReceiverName || '',
      settings: {
        maintenanceDeadline: society.settings?.maintenanceDeadline || 10,
        defaultMonthlyMaintenance: society.settings?.defaultMonthlyMaintenance || 3500,
        penaltyRate: society.settings?.penaltyRate || 150
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateSociety = async (e) => {
    e.preventDefault();
    if (!editingSociety) return;

    try {
      const wingLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const numWings = Number(editFormData.numberOfWings) || 4;
      const numFloors = Number(editFormData.numberOfFloors) || 10;
      
      const wings = [];
      for (let i = 0; i < Math.min(numWings, wingLetters.length); i++) {
        wings.push({
          name: wingLetters[i],
          floors: numFloors,
          totalFlats: numFloors * 4
        });
      }

      const payload = {
        ...editFormData,
        numberOfWings: numWings,
        numberOfFloors: numFloors,
        wings
      };

      await societyAPI.updateSociety(editingSociety._id, payload);
      toast.success('Society settings updated successfully!');
      setShowEditModal(false);
      fetchSocieties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update society settings');
    }
  };

  const filtered = societies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Societies Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage registered residential complexes, wing/floor structures, and payment beneficiaries</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Onboard New Society
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by society name or city..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Societies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((society) => (
          <div key={society._id} className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{society.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin size={13} />
                      <span>{society.city}, {society.state}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-[11px]">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span>Wings & Floors:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {society.numberOfWings || society.wings?.length || 4} Wings • {society.numberOfFloors || 10} Floors
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registered Members:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{society.totalMembers || 0} residents</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact Email:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{society.contactEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Maintenance:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    ₹{society.settings?.defaultMonthlyMaintenance || 3500} / mo
                  </span>
                </div>
                {society.paymentReceiverName && (
                  <div className="flex items-center justify-between">
                    <span>Payment Beneficiary:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{society.paymentReceiverName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                <span>Due Date: </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{society.settings?.maintenanceDeadline || 10}th of month</span>
              </div>
              <button
                onClick={() => handleOpenEdit(society)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit size={13} /> Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard New Society Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Onboard New Housing Society</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSociety} className="space-y-3.5 py-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Society Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Palms Residency"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Number of Wings</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.numberOfWings}
                    onChange={(e) => setFormData({ ...formData, numberOfWings: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 4 creates Wings A, B, C, D</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.numberOfFloors}
                    onChange={(e) => setFormData({ ...formData, numberOfFloors: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 10 floors per wing</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Plot 55, Link Road"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="office@royalpalms.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 11223"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Razorpay Beneficiary / Account Receiver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Palms Housing Society Maintenance A/C"
                  value={formData.paymentReceiverName}
                  onChange={(e) => setFormData({ ...formData, paymentReceiverName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Default Maintenance (₹)</label>
                  <input
                    type="number"
                    value={formData.settings.defaultMonthlyMaintenance}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, defaultMonthlyMaintenance: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Monthly Deadline (Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={formData.settings.maintenanceDeadline}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, maintenanceDeadline: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm"
                >
                  Confirm & Create Society
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Society Settings Modal */}
      {showEditModal && editingSociety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Edit Society Settings</h3>
                <p className="text-xs text-slate-500">{editingSociety.name}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSociety} className="space-y-3.5 py-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Society Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Number of Wings</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={editFormData.numberOfWings}
                    onChange={(e) => setEditFormData({ ...editFormData, numberOfWings: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={editFormData.numberOfFloors}
                    onChange={(e) => setEditFormData({ ...editFormData, numberOfFloors: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={editFormData.contactEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.contactPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Beneficiary / Account Receiver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emerald Heights Society Account"
                  value={editFormData.paymentReceiverName}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentReceiverName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Default Maintenance (₹)</label>
                  <input
                    type="number"
                    value={editFormData.settings.defaultMonthlyMaintenance}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      settings: { ...editFormData.settings, defaultMonthlyMaintenance: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Monthly Deadline (Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={editFormData.settings.maintenanceDeadline}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      settings: { ...editFormData.settings, maintenanceDeadline: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm"
                >
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

export default Societies;
