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
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/40',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      label: 'Completed',
      value: done,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl glass-panel border ${card.border} transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
              {card.label === 'Completed' && total > 0 && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
