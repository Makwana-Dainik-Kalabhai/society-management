import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon, color = 'indigo', subtitle }) => {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-200 dark:hover:border-indigo-800'
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-200 dark:hover:border-emerald-800'
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-200 dark:hover:border-amber-800'
    },
    rose: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-200 dark:hover:border-rose-800'
    },
    purple: {
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-200 dark:hover:border-purple-800'
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.indigo;

  return (
    <div className={`glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 transition-all ${currentTheme.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentTheme.iconBg}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
        
        {(change || subtitle) && (
          <div className="flex items-center gap-1.5 mt-2">
            {change && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
