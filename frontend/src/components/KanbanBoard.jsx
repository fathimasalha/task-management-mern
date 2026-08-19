import React from 'react';
import {
  Clock,
  CheckCircle2,
  ListTodo,
  Plus,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import TaskCard from './TaskCard';

export const KanbanBoard = ({
  tasks,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onOpenCreateModal,
}) => {
  const columns = [
    {
      id: 'PENDING',
      title: 'To Do / Pending',
      icon: ListTodo,
      color: 'border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/40',
      badge: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      icon: Clock,
      color: 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20',
      badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
    },
    {
      id: 'DONE',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20',
      badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className={`rounded-3xl p-4 sm:p-5 border-2 ${col.color} flex flex-col min-h-[500px] transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {col.title}
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-3.5 flex-1">
              {columnTasks.length === 0 ? (
                <div className="h-44 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400">
                  <p>No tasks in {col.title.toLowerCase()}</p>
                  {col.id === 'PENDING' && (
                    <button
                      onClick={onOpenCreateModal}
                      className="mt-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add a task
                    </button>
                  )}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
