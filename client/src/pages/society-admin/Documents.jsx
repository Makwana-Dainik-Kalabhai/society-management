import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Shield, Tag, ExternalLink, Upload, Loader2, FileSpreadsheet, FileCode, CheckCircle2 } from 'lucide-react';
import { communityAPI, authAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'bylaws',
    fileUrl: '',
    fileSize: '1.2 MB'
  });

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await communityAPI.getDocuments(params);
      setDocuments(res.data.documents || []);
    } catch (err) {
      toast.error('Failed to load repository');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      return toast.error('File size must be under 25MB');
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploadingFile(true);
    try {
      const res = await authAPI.uploadFile(uploadData);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setUploadedFileInfo({
        name: file.name,
        size: sizeMB,
        url: res.data.fileUrl
      });
      setFormData(prev => ({
        ...prev,
        fileUrl: res.data.fileUrl,
        fileSize: sizeMB,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      return toast.error('Please attach a document file');
    }

    try {
      await communityAPI.uploadDocument(formData);
      toast.success('Document saved to community repository!');
      setShowAddModal(false);
      fetchDocuments();
      setFormData({
        title: '',
        description: '',
        category: 'bylaws',
        fileUrl: '',
        fileSize: ''
      });
      setUploadedFileInfo(null);
    } catch (err) {
      toast.error('Failed to save document');
    }
  };

  const getFormatBadge = (url) => {
    if (!url) return 'PDF';
    const ext = url.split('.').pop()?.toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'EXCEL / CSV';
    if (['doc', 'docx'].includes(ext)) return 'DOC / WORD';
    if (['pdf'].includes(ext)) return 'PDF';
    return (ext || 'PDF').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Official Document Repository</h2>
          <p className="text-xs sm:text-sm text-slate-500">Attach and access registered society bylaws, audited balance sheets, Excel sheets, and circulars</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Upload New Document
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'bylaws', 'financial', 'guidelines', 'meeting_minutes', 'legal'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {doc.category}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1.5">{doc.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4">{doc.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{doc.fileSize || '1.5 MB'} • {getFormatBadge(doc.fileUrl)}</span>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 font-bold text-xs inline-flex items-center gap-1 transition-all"
              >
                <Download size={13} /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">Upload Document to Repository</h3>
            
            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Attach File from Device (PDF, Excel, CSV, Word, Docs)</label>
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 transition-colors text-center">
                  {uploadingFile ? (
                    <span className="flex items-center gap-2 text-xs text-brand-600 font-semibold"><Loader2 className="animate-spin" size={16} /> Uploading file to storage...</span>
                  ) : uploadedFileInfo ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                      <CheckCircle2 size={16} />
                      <span className="truncate max-w-[200px]">{uploadedFileInfo.name} ({uploadedFileInfo.size})</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to browse file</span>
                      <span className="text-[10px] text-slate-400">PDF, XLSX, CSV, DOC, DOCX up to 25MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Society Fire Safety Audit Report 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="bylaws">Bylaws & Rules</option>
                  <option value="financial">Financial Audits & Statements</option>
                  <option value="guidelines">Guidelines & Circulars</option>
                  <option value="meeting_minutes">AGM Meeting Minutes</option>
                  <option value="legal">Legal & NOC Forms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of contents..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={uploadingFile || !formData.fileUrl}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold disabled:opacity-50"
                >
                  Save & Publish Document
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

export default Documents;
