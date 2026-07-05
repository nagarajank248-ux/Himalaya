'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Trash2, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Plus, 
  Tags,
  Activity,
  UserCheck2,
  Calendar
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { 
    users, 
    updateUserStatus, 
    updateUserRole, 
    categories, 
    addCategory, 
    deleteCategory,
    activityLogs 
  } = useCRM();
  
  const { user: currentUser } = useAuth();
  
  // States
  const [newCatInput, setNewCatInput] = useState('');

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      addCategory(newCatInput);
      setNewCatInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Admin Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage system users, categories, settings, and monitor full CRM actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Manage Users (Col-Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                User Management
              </h2>
            </div>
            <p className="text-xs text-slate-500">Change permissions, roles, and suspend user accounts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-800 dark:text-slate-200">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    {/* User profile details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={usr.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'} 
                          alt={usr.name}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {usr.name} {usr.id === currentUser?.id && <span className="text-[9px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-normal ml-1">You</span>}
                          </p>
                          <p className="text-[10px] text-slate-500">{usr.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-350 capitalize">
                      <select
                        value={usr.role}
                        disabled={usr.id === currentUser?.id}
                        onChange={(e) => updateUserRole(usr.id, e.target.value as any)}
                        className="bg-transparent border-0 font-semibold focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        usr.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                      }`}>
                        {usr.status}
                      </span>
                    </td>

                    {/* Suspend / Activate toggles */}
                    <td className="py-3.5 px-4 text-right">
                      {usr.id !== currentUser?.id && (
                        <button
                          onClick={() => updateUserStatus(usr.id, usr.status === 'active' ? 'suspended' : 'active')}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-colors ml-auto ${
                            usr.status === 'active'
                              ? 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/20 dark:bg-rose-950/10 dark:text-rose-400'
                              : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/20 dark:bg-emerald-950/10 dark:text-emerald-400'
                          }`}
                        >
                          {usr.status === 'active' ? (
                            <>
                              <UserX className="h-3 w-3" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3" />
                              Activate
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manage Categories (Col-Span 1) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tags className="h-5 w-5 text-purple-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Builder Categories
              </h2>
            </div>
            <p className="text-xs text-slate-500">Configure public business category filters.</p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. Roofers"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Category Chip List */}
          <div className="flex flex-wrap gap-2 pt-2 max-h-[220px] overflow-y-auto pr-1">
            {categories.map((cat, idx) => (
              <span 
                key={idx}
                className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => deleteCategory(cat)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                  title={`Delete ${cat}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Monitor Activity Logs Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Full System Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-500">Monitor all actions taken in the CRM in chronological order.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Operator</th>
                <th className="py-2.5 px-4">Action Type</th>
                <th className="py-2.5 px-4">Target Details</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-800 dark:text-slate-200">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/20">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck2 className="h-4 w-4 text-slate-400" />
                    {log.userName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 px-2 py-0.5 rounded-md font-semibold text-[10px] tracking-wide uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-650 dark:text-slate-400 italic">
                    {log.target}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[10px]">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}

              {activityLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No activity logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
