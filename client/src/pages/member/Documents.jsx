import React, { useState, useEffect } from 'react';
import { FileText, Download, Shield } from 'lucide-react';
import { communityAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const MemberDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
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
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Bylaws & Guidelines</h2>
        <p className="text-xs sm:text-sm text-slate-500">Official housing society documentation, audit statements, Excel sheets, and circulars</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'bylaws', 'financial', 'guidelines', 'meeting_minutes'].map((cat) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 flex items-center justify-center font-bold">
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
    </div>
  );
};

export default MemberDocuments;
