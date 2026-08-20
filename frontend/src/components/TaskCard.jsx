import React from 'react';
import {
  Calendar,
  MapPin,
  Paperclip,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import WeatherBadge from './WeatherBadge';

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}) => {
  const isDone = task.status === 'DONE';
  const isOverdue =
    task.dueDate && !isDone && new Date(task.dueDate) < new Date();

  // Priority color & accent border config
  const priorityConfig = {
    LOW: {
      label: 'Low',
      class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      borderAccent: 'border-l-4 border-l-slate-400 dark:border-l-slate-600',
    },
    MEDIUM: {
      label: 'Medium',
      class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      borderAccent: 'border-l-4 border-l-blue-500',
    },
    HIGH: {
      label: 'High',
      class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      borderAccent: 'border-l-4 border-l-amber-500',
    },
    URGENT: {
      label: 'Urgent',
      class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse-subtle',
      borderAccent: 'border-l-4 border-l-rose-500',
    },
  };

  // Status color config
  const statusConfig = {
    PENDING: {
      label: 'Pending',
      class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    },
    DONE: {
      label: 'Done',
      class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    },
  };

  const priorityStyle = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const statusStyle = statusConfig[task.status] || statusConfig.PENDING;

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className={`group relative p-4 sm:p-5 rounded-3xl glass-panel border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/60 flex flex-col justify-between ${priorityStyle.borderAccent} ${
        isDone ? 'opacity-75 bg-slate-50/50 dark:bg-slate-900/40' : ''
      }`}
    >
      <div>
        {/* Top Header: Priority & Status Pill + Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${priorityStyle.class}`}
            >
              {priorityStyle.label}
            </span>

            {/* Quick Status toggle pill */}
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value)}
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg cursor-pointer border-none outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all ${statusStyle.class}`}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              title="Delete Task"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Title & Description */}
        <div className="cursor-pointer" onClick={() => onView(task)}>
          <h3
            className={`text-base font-semibold text-slate-900 dark:text-white leading-snug mb-1.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors ${
              isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {task.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Info: Weather, Date, Attachment */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Due date */}
          {formattedDate && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
                isOverdue
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 text-rose-500" />
              ) : (
                <Calendar className="w-3 h-3 text-slate-400" />
              )}
              <span>{isOverdue ? `Overdue (${formattedDate})` : formattedDate}</span>
            </div>
          )}

          {/* Weather Badge */}
          {task.location && (
            <WeatherBadge
              weather={task.weatherSnapshot}
              location={task.location}
              size="sm"
            />
          )}
        </div>

        {/* Attachment link */}
        {task.fileUrl && (
          <a
            href={task.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={task.fileName || 'View attachment'}
            className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline px-2 py-1 rounded-md bg-brand-50/80 dark:bg-brand-950/40 text-[11px] font-medium transition-colors"
          >
            <Paperclip className="w-3 h-3" />
            <span className="truncate max-w-[100px]">
              {task.fileName || 'Attachment'}
            </span>
          </a>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
