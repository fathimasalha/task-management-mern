import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-md shadow-brand-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
