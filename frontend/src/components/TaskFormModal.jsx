import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Calendar,
  MapPin,
  Tag,
  FileText,
  AlertCircle,
  Loader2,
  CloudSun,
  CheckCircle2,
  PlusCircle,
  Edit3,
} from 'lucide-react';
import API from '../services/api';
import WeatherBadge from './WeatherBadge';

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    location: '',
    tags: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [existingFileName, setExistingFileName] = useState('');
  const [removeExistingFile, setRemoveExistingFile] = useState(false);

  // Weather live preview state
  const [weatherPreview, setWeatherPreview] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const weatherTimeoutRef = useRef(null);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'PENDING',
        priority: taskToEdit.priority || 'MEDIUM',
        dueDate: taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
          : '',
        location: taskToEdit.location || '',
        tags: taskToEdit.tags ? taskToEdit.tags.join(', ') : '',
      });
      setExistingFileUrl(taskToEdit.fileUrl || '');
      setExistingFileName(taskToEdit.fileName || '');
      setWeatherPreview(taskToEdit.weatherSnapshot || null);
      setRemoveExistingFile(false);
      setSelectedFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: '',
        location: '',
        tags: '',
      });
      setSelectedFile(null);
      setExistingFileUrl('');
      setExistingFileName('');
      setWeatherPreview(null);
      setRemoveExistingFile(false);
    }
  }, [taskToEdit, isOpen]);

  // Debounced live weather preview lookup
  const handleLocationChange = (val) => {
    setFormData((prev) => ({ ...prev, location: val }));
    if (weatherTimeoutRef.current) clearTimeout(weatherTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setWeatherPreview(null);
      return;
    }

    weatherTimeoutRef.current = setTimeout(async () => {
      try {
        setLoadingWeather(true);
        const { data } = await API.get(`/tasks/weather/preview?city=${encodeURIComponent(val.trim())}`);
        if (data.success) {
          setWeatherPreview(data.data);
        }
      } catch (err) {
        console.warn('Weather preview fetch failed:', err);
      } finally {
        setLoadingWeather(false);
      }
    }, 600);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setRemoveExistingFile(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('status', formData.status);
    data.append('priority', formData.priority);
    if (formData.dueDate) data.append('dueDate', formData.dueDate);
    data.append('location', formData.location.trim());

    // Parse comma-separated tags
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    data.append('tags', JSON.stringify(tagsArray));

    if (selectedFile) {
      data.append('file', selectedFile);
    }

    if (removeExistingFile) {
      data.append('removeFile', 'true');
    }

    onSubmit(data);
  };

  if (!isOpen) return null;

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 flex-shrink-0">
              {taskToEdit ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {taskToEdit
                  ? 'Update task details, attachments, or change status'
                  : 'Add a new task with due date, priority, and live weather location'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content Wrapper */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Middle Content */}
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4.5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Q3 Product Presentation"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Add key notes, steps, or objectives..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-400 resize-none shadow-sm"
              />
            </div>

            {/* Priority & Status in clean 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all shadow-sm font-medium"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent ⚡</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Task Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all shadow-sm font-medium"
                >
                  <option value="PENDING">Pending (To Do)</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed (Done)</option>
                </select>
              </div>
            </div>

            {/* Due Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Location (City / Place)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, Tokyo"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm font-medium"
                  />
                  {loadingWeather && (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600 absolute right-3 top-3.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Weather Live Preview Chip */}
            {(weatherPreview || formData.location) && (
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold">
                    Live Weather at Location:
                  </span>
                </div>
                <WeatherBadge
                  weather={weatherPreview}
                  location={formData.location}
                  size="sm"
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Frontend, Release"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* File Attachment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Attachment (Image, PDF, Document)
              </label>

              {/* Existing File indicator */}
              {existingFileUrl && !removeExistingFile && !selectedFile && (
                <div className="mb-2.5 p-3 rounded-xl bg-slate-100 flex items-center justify-between text-xs border border-slate-200">
                  <a
                    href={existingFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 font-semibold hover:underline truncate max-w-[320px]"
                  >
                    📄 {existingFileName || 'Attached File'}
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemoveExistingFile(true)}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Selected File indicator */}
              {selectedFile && (
                <div className="mb-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-700">
                  <span className="font-semibold truncate max-w-[320px]">
                    📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}

              <label className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/60 hover:bg-brand-50/20">
                <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">
                  Click to browse or drag and drop file
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Supports PNG, JPG, PDF, Word, Excel (up to 10MB)
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-brand-500/25 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
