import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Plus,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                TaskFlow
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                MERN
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Smart Task & Weather Workspace
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* New Task Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-brand-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">Active User</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl p-2 z-30 shadow-xl border border-slate-200 animate-fade-in divide-y divide-slate-100">
                  <div className="px-3.5 py-3">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
