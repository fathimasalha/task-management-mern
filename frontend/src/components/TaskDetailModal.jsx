import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Tag,
  Download,
  CloudSun,
  FileCheck2,
} from 'lucide-react';
import WeatherBadge from './WeatherBadge';

export const TaskDetailModal = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!task) return null;

  const isDone = task.status === 'DONE';
  const isOverdue =
    task.dueDate && !isDone && new Date(task.dueDate) < new Date();

  const isImageAttachment =
    task.fileUrl &&
    /\.(jpg|jpeg|png|webp|gif)$/i.test(task.fileUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card with increased width (max-w-2xl) */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl z-10 shadow-2xl animate-slide-up max-h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Fixed Header with enhanced top padding */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100 bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl ${
                task.priority === 'URGENT'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : task.priority === 'HIGH'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {task.priority} Priority
            </span>

            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value)}
              className={`text-xs font-bold px-3 py-1 rounded-xl cursor-pointer border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm ${
                task.status === 'DONE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-white text-slate-700'
              }`}
            >
              <option value="PENDING">Status: Pending</option>
              <option value="IN_PROGRESS">Status: In Progress</option>
              <option value="DONE">Status: Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              title="Edit Task"
              className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-200/60 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(task._id);
              }}
              title="Delete Task"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Middle Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          {/* Title */}
          <div>
            <h1
              className={`text-2xl font-extrabold text-slate-900 leading-tight ${
                isDone ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h1>
          </div>

          {/* Description */}
          {task.description && (
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date & Timelines */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Schedule & Deadlines
              </span>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span className="font-semibold text-slate-800">
                    Due Date:{' '}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No due date'}
                  </span>
                </div>
                {isOverdue && (
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>This task is past its due date</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Created {new Date(task.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Weather Context */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Location & Environment
              </span>
              {task.location ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{task.location}</span>
                  </div>
                  <WeatherBadge
                    weather={task.weatherSnapshot}
                    location={task.location}
                    size="md"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No location attached
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Tags
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {task.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-semibold"
                  >
                    <Tag className="w-3 h-3 text-brand-600" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Attachment Preview */}
          {task.fileUrl && (
            <div className="p-4.5 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attached Document
                </span>
                <a
                  href={task.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-1.5 text-xs text-brand-600 font-bold hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>

              {isImageAttachment ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white max-h-72 flex items-center justify-center p-1">
                  <img
                    src={task.fileUrl}
                    alt={task.fileName || 'Attachment preview'}
                    className="max-h-64 object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {task.fileName || 'File Attachment'}
                    </p>
                    <p className="text-[11px] text-slate-400 uppercase font-medium">
                      {task.fileType || 'Document'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
