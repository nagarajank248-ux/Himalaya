'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, BuilderBusiness, User, ActivityLog } from '../types/crm';
import { mockLeads, mockBuilders, mockUsers, mockActivityLogs, mockCategories } from '../utils/mockData';
import { useAuth } from './AuthContext';

interface CRMContextType {
  leads: Lead[];
  builders: BuilderBusiness[];
  users: User[];
  activityLogs: ActivityLog[];
  categories: string[];
  settings: {
    darkMode: boolean;
    language: 'en' | 'es' | 'fr';
    notificationsEnabled: boolean;
  };
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info' | 'reminder'; message: string; timestamp: string }>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  toggleFavoriteLead: (id: string) => void;
  logActivity: (action: string, target: string) => void;
  addNotification: (type: 'success' | 'error' | 'info' | 'reminder', message: string) => void;
  dismissNotification: (id: string) => void;
  updateSettings: (newSettings: Partial<CRMContextType['settings']>) => void;
  backupData: () => void;
  restoreData: (jsonData: string) => boolean;
  
  // Admin Operations
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  updateUserRole: (userId: string, role: 'admin' | 'user') => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [builders, setBuilders] = useState<BuilderBusiness[]>(mockBuilders);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<{
    darkMode: boolean;
    language: 'en' | 'es' | 'fr';
    notificationsEnabled: boolean;
  }>({
    darkMode: false,
    language: 'en',
    notificationsEnabled: true,
  });
  const [notifications, setNotifications] = useState<CRMContextType['notifications']>([]);

  // Load initial data from localStorage or mock data
  useEffect(() => {
    const localLeads = localStorage.getItem('crm_leads');
    if (localLeads) {
      setLeads(JSON.parse(localLeads));
    } else {
      setLeads(mockLeads);
      localStorage.setItem('crm_leads', JSON.stringify(mockLeads));
    }

    const localUsers = localStorage.getItem('crm_users');
    if (localUsers) {
      setUsers(JSON.parse(localUsers));
    } else {
      setUsers(mockUsers);
      localStorage.setItem('crm_users', JSON.stringify(mockUsers));
    }

    const localLogs = localStorage.getItem('crm_activity_logs');
    if (localLogs) {
      setActivityLogs(JSON.parse(localLogs));
    } else {
      setActivityLogs(mockActivityLogs);
      localStorage.setItem('crm_activity_logs', JSON.stringify(mockActivityLogs));
    }

    const localCategories = localStorage.getItem('crm_categories');
    if (localCategories) {
      setCategories(JSON.parse(localCategories));
    } else {
      setCategories(mockCategories);
      localStorage.setItem('crm_categories', JSON.stringify(mockCategories));
    }

    const localSettings = localStorage.getItem('crm_settings');
    if (localSettings) {
      const parsedSettings = JSON.parse(localSettings);
      setSettings(parsedSettings);
      applyTheme(parsedSettings.darkMode);
    } else {
      applyTheme(false);
    }
  }, []);

  // Save changes helper
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const logActivity = (action: string, target: string) => {
    const newLog: ActivityLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Anonymous User',
      action,
      target,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100); // Keep last 100 logs
    setActivityLogs(updatedLogs);
    saveToLocal('crm_activity_logs', updatedLogs);
  };

  const addNotification = (type: 'success' | 'error' | 'info' | 'reminder', message: string) => {
    if (!settings.notificationsEnabled && type !== 'error') return;
    
    const id = 'notif_' + Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 20)); // Limit to 20

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 3000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Check for follow-up reminders on load & at intervals
  useEffect(() => {
    if (leads.length === 0) return;
    
    const checkReminders = () => {
      const today = new Date().toISOString().split('T')[0];
      leads.forEach((lead) => {
        if (lead.followUpDate === today && lead.status !== 'closed') {
          // Check if reminder was already shown today
          const reminderKey = `reminder_shown_${lead.id}_${today}`;
          if (!localStorage.getItem(reminderKey)) {
            addNotification('reminder', `Follow up with ${lead.name} (${lead.company}) is scheduled for today!`);
            localStorage.setItem(reminderKey, 'true');
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // check every minute
    return () => clearInterval(interval);
  }, [leads]);

  // Lead CRUD
  const addLead = (newLeadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: 'lead_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveToLocal('crm_leads', updated);
    logActivity('Added Lead', `${newLead.name} (${newLead.company})`);
    addNotification('success', `Lead "${newLead.name}" added successfully.`);
  };

  const updateLead = (updatedLead: Lead) => {
    const updated = leads.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    setLeads(updated);
    saveToLocal('crm_leads', updated);
    logActivity('Updated Lead', `${updatedLead.name} (${updatedLead.company})`);
    addNotification('success', `Lead "${updatedLead.name}" updated successfully.`);
  };

  const deleteLead = (id: string) => {
    const leadToDelete = leads.find((l) => l.id === id);
    if (!leadToDelete) return;
    
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);
    saveToLocal('crm_leads', updated);
    logActivity('Deleted Lead', `${leadToDelete.name} (${leadToDelete.company})`);
    addNotification('success', `Lead "${leadToDelete.name}" deleted.`);
  };

  const toggleFavoriteLead = (id: string) => {
    const updated = leads.map((l) => {
      if (l.id === id) {
        const nextFav = !l.favorite;
        logActivity(nextFav ? 'Favorited Lead' : 'Unfavorited Lead', `${l.name} (${l.company})`);
        return { ...l, favorite: nextFav };
      }
      return l;
    });
    setLeads(updated);
    saveToLocal('crm_leads', updated);
  };

  // Settings
  const updateSettings = (newSettings: Partial<CRMContextType['settings']>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveToLocal('crm_settings', updated);
    
    if (newSettings.darkMode !== undefined) {
      applyTheme(newSettings.darkMode);
    }
    
    addNotification('success', 'Settings updated successfully.');
  };

  // Backup & Restore
  const backupData = () => {
    const backupObj = {
      leads,
      users,
      activityLogs,
      categories,
      settings
    };
    const jsonString = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logActivity('Data Backup', 'Downloaded full system backup');
    addNotification('success', 'System backup file downloaded.');
  };

  const restoreData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.leads && Array.isArray(parsed.leads)) {
        setLeads(parsed.leads);
        saveToLocal('crm_leads', parsed.leads);
        
        if (parsed.users) {
          setUsers(parsed.users);
          saveToLocal('crm_users', parsed.users);
        }
        if (parsed.activityLogs) {
          setActivityLogs(parsed.activityLogs);
          saveToLocal('crm_activity_logs', parsed.activityLogs);
        }
        if (parsed.categories) {
          setCategories(parsed.categories);
          saveToLocal('crm_categories', parsed.categories);
        }
        if (parsed.settings) {
          setSettings(parsed.settings);
          saveToLocal('crm_settings', parsed.settings);
          applyTheme(parsed.settings.darkMode);
        }
        
        logActivity('Data Restore', 'Restored system database from file');
        addNotification('success', 'CRM database restored successfully.');
        return true;
      }
      return false;
    } catch (e) {
      addNotification('error', 'Failed to parse restore file. Invalid JSON format.');
      return false;
    }
  };

  // Admin Operations
  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    const updated = users.map((u) => (u.id === userId ? { ...u, status } : u));
    setUsers(updated);
    saveToLocal('crm_users', updated);
    
    const targetUser = users.find((u) => u.id === userId);
    logActivity(status === 'suspended' ? 'Suspended User' : 'Activated User', targetUser?.name || userId);
    addNotification('success', `User ${targetUser?.name || 'status'} updated to ${status}.`);
  };

  const updateUserRole = (userId: string, role: 'admin' | 'user') => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role } : u));
    setUsers(updated);
    saveToLocal('crm_users', updated);
    
    const targetUser = users.find((u) => u.id === userId);
    logActivity('Updated User Role', `${targetUser?.name} changed to ${role}`);
    addNotification('success', `User ${targetUser?.name || 'role'} updated to ${role}.`);
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveToLocal('crm_categories', updated);
    logActivity('Added Category', trimmed);
    addNotification('success', `Category "${trimmed}" added.`);
  };

  const deleteCategory = (category: string) => {
    const updated = categories.filter((c) => c !== category);
    setCategories(updated);
    saveToLocal('crm_categories', updated);
    logActivity('Deleted Category', category);
    addNotification('success', `Category "${category}" deleted.`);
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        builders,
        users,
        activityLogs,
        categories,
        settings,
        notifications,
        addLead,
        updateLead,
        deleteLead,
        toggleFavoriteLead,
        logActivity,
        addNotification,
        dismissNotification,
        updateSettings,
        backupData,
        restoreData,
        updateUserStatus,
        updateUserRole,
        addCategory,
        deleteCategory
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
