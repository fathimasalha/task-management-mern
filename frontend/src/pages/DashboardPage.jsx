import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import StatsOverview from '../components/StatsOverview';
import TaskCard from '../components/TaskCard';
import KanbanBoard from '../components/KanbanBoard';
import TaskFormModal from '../components/TaskFormModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { useToast } from '../components/Toast';
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  Kanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Calendar,
  Sparkles,
  Inbox,
} from 'lucide-react';

export const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'kanban'

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasMore: false,
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  const toast = useToast();
  const searchTimeoutRef = useRef(null);

  // Fetch tasks with active filters & pagination
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: viewMode === 'kanban' ? 50 : 12, // More items for Kanban
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await API.get('/tasks', { params });
      if (data.success) {
        setTasks(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks from server');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, startDate, endDate, sortBy, sortOrder, viewMode]);

  // Fetch summary stats
  const fetchStats = async () => {
    try {
      const { data } = await API.get('/tasks/stats/summary');
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.warn('Could not load task stats:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks]);

  // Handle Search Input with Debounce
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search || statusFilter || priorityFilter || startDate || endDate);

  // Create or Update task handler
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (taskToEdit) {
        const { data } = await API.put(`/tasks/${taskToEdit._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Task updated successfully!');
        if (selectedTaskDetail?._id === taskToEdit._id) {
          setSelectedTaskDetail(data.data);
        }
      } else {
        await API.post('/tasks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Task created! Confirmation email queued.');
      }
      setIsFormOpen(false);
      setTaskToEdit(null);
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task handler
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      if (selectedTaskDetail?._id === id) {
        setSelectedTaskDetail(null);
      }
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  // Quick Status change (e.g. from card select or dropdown)
  const handleStatusChange = async (task, newStatus) => {
    try {
      const { data } = await API.put(`/tasks/${task._id}`, { status: newStatus });
      toast.success(
        newStatus === 'DONE'
          ? '🎉 Task completed! Notification sent.'
          : `Task moved to ${newStatus.replace('_', ' ')}`
      );
      if (selectedTaskDetail?._id === task._id) {
        setSelectedTaskDetail(data.data);
      }
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      {/* Navigation Header */}
      <Navbar
        onOpenCreateModal={() => {
          setTaskToEdit(null);
          setIsFormOpen(true);
        }}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Top Metric Cards */}
        <StatsOverview stats={stats} />

        {/* Action Controls & Toolbar */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search tasks by title, description, or location..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* View Switcher & Actions */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  title="Kanban Board View"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-2xl shadow-sm hover:shadow-md hover:shadow-brand-500/25 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Multi-Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 mr-1">Status:</span>
              {['', 'PENDING', 'IN_PROGRESS', 'DONE'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === '' ? 'All' : st === 'IN_PROGRESS' ? 'In Progress' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-semibold text-slate-400">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="dueDate-asc">Due Date (Soonest)</option>
                <option value="title-asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Content Area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading your workspace...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 glass-panel">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {hasActiveFilters ? 'No tasks matched your filters' : 'Your task board is clear!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or resetting filters to view tasks.'
                : 'Stay organized, track weather at your task locations, and get automated email updates.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first task</span>
              </button>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <KanbanBoard
            tasks={tasks}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteTask}
            onView={(task) => setSelectedTaskDetail(task)}
            onStatusChange={handleStatusChange}
            onOpenCreateModal={() => {
              setTaskToEdit(null);
              setIsFormOpen(true);
            }}
          />
        ) : (
          /* Grid View */
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  onView={(t) => setSelectedTaskDetail(t)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-500">
                <span>
                  Showing {tasks.length} of {meta.total} tasks
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold px-2">
                    Page {page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page >= meta.totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        taskToEdit={taskToEdit}
        isSubmitting={isSubmitting}
      />

      {/* Task Full Detail Modal */}
      <TaskDetailModal
        task={selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        onEdit={(task) => {
          setTaskToEdit(task);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default DashboardPage;
