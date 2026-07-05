export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  status: 'new' | 'pending' | 'contacted' | 'closed';
  priority: 'low' | 'medium' | 'high';
  followUpDate: string; // ISO date string
  tags: string[];
  favorite: boolean;
  createdAt: string; // ISO date string
}

export interface BuilderBusiness {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  category: string;
  rating?: number;
  website?: string;
  googleMapsLink?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  avatar?: string;
  lastActive: string; // ISO date string
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string; // ISO date string
}

export interface CRMStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  pendingLeads: number;
  favoritesCount: number;
}
