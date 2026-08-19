import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: {
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info'),
    }}}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              item.type === 'success'
                ? 'bg-emerald-500/90 text-white border-emerald-400'
                : item.type === 'error'
                ? 'bg-rose-600/90 text-white border-rose-500'
                : 'bg-indigo-600/90 text-white border-indigo-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {item.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium leading-snug">{item.message}</span>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="ml-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
