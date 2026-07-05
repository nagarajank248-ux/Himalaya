'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCRM } from '../context/CRMContext';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useCRM();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-amber-500 animate-bounce" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40';
      case 'error':
        return 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40';
      case 'reminder':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40';
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 max-w-sm w-[90%] sm:w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border shadow-md backdrop-blur-md ${getBgColor(
              notif.type
            )}`}
          >
            <div className="flex items-center gap-2 flex-grow min-w-0">
              <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-1">
                {notif.message}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
