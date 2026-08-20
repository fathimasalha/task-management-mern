import React from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export const StatsOverview = ({ stats }) => {
  const {
    total = 0,
    pending = 0,
    inProgress = 0,
    done = 0,
    overdue = 0,
    completionRate = 0,
  } = stats || {};

  const cards = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      border: 'border-indigo-100/80 dark:border-indigo-900/40',
      accent: 'from-indigo-500/10 to-transparent',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-100/80 dark:border-amber-900/40',
      accent: 'from-amber-500/10 to-transparent',
    },
    {
      label: 'Completed',
      value: done,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-100/80 dark:border-emerald-900/40',
      accent: 'from-emerald-500/10 to-transparent',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-100/80 dark:border-rose-900/40',
      accent: 'from-rose-500/10 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl glass-panel border ${card.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/60 group`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.accent} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-60`} />
            
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-2xl ${card.bg} ${card.color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
              {card.label === 'Completed' && total > 0 && (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <TrendingUp className="w-3 h-3" />
                  {completionRate}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
