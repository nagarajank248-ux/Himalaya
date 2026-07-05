'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  User, 
  Mail, 
  Moon, 
  Sun, 
  Languages, 
  Database, 
  Download, 
  Upload, 
  Save,
  CheckCircle,
  BellRing
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings, backupData, restoreData, addNotification } = useCRM();

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileName, profileEmail);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Restore Handler
  const handleRestoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const success = restoreData(text);
        if (success) {
          // File input reset
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize your workspace layout, language options, notifications, and perform data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <User className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              User Profile
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition-colors cursor-pointer w-full justify-center"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="h-4.5 w-4.5" />
                  Profile Updated!
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  Save Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Display / Theme Config */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <Settings className="h-5 w-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Application Customization
            </h2>
          </div>

          {/* Theme Toggler */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Visual Theme mode
              </p>
              <p className="text-[10px] text-slate-500">Toggle between dark and light templates.</p>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="flex h-9 w-18 items-center rounded-full bg-slate-100 p-1 dark:bg-slate-800 cursor-pointer transition-colors relative"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white transition-all transform ${
                settings.darkMode ? 'translate-x-9' : 'translate-x-0'
              }`}>
                {settings.darkMode ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              </span>
            </button>
          </div>

          {/* Language support */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/35">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Language Support
              </p>
              <p className="text-[10px] text-slate-500">Select active vocabulary localized dictionary.</p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-slate-400" />
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value as any })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-950 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="en">English (EN)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>
          </div>

          {/* Toast notifications enable */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/35">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Follow-up Reminders
              </p>
              <p className="text-[10px] text-slate-500">Enable toast notifications for scheduled contacts.</p>
            </div>
            <button
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`flex h-6 w-11 items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform transform ${
                settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

      </div>

      {/* Backup and Restore Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
          <Database className="h-5 w-5 text-emerald-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h2>
            <p className="text-xs text-slate-500">Download system backups and restore from historical backups.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Backup Button */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Download className="h-4 w-4 text-blue-500" />
              Backup CRM Database
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Export all lead pipelines, categories, and settings to a JSON file. Store this file securely.
            </p>
            <button
              onClick={backupData}
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer w-full justify-center"
            >
              Download Backup File
            </button>
          </div>

          {/* Restore Button */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-emerald-500" />
              Restore CRM Database
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Upload a valid `.json` backup file to overwrite your local CRM data. Warning: Current progress will be replaced.
            </p>
            <label className="flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer w-full text-center">
              Upload Restore File
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
