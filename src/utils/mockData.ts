import { BuilderBusiness, Lead, User, ActivityLog } from '../types/crm';

export const mockBuilders: BuilderBusiness[] = [
  {
    id: 'b1',
    name: 'Alpha Builders & Developers',
    phone: '+1 217-555-0190',
    address: '123 Main St, Springfield',
    city: 'Springfield',
    district: 'Sangamon',
    state: 'Illinois',
    category: 'Residential Builders',
    rating: 4.8,
    website: 'https://alphabuilders.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Alpha+Builders+Springfield',
    notes: 'Specializes in custom-built family homes and modern duplexes.'
  },
  {
    id: 'b2',
    name: 'Summit Commercial Construction',
    phone: '+1 312-555-0143',
    address: '456 Commerce Ave, Chicago',
    city: 'Chicago',
    district: 'Cook',
    state: 'Illinois',
    category: 'Commercial Contractors',
    rating: 4.5,
    website: 'https://summitcommercial.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Summit+Commercial+Chicago',
    notes: 'Handles medium to large scale retail and office spaces.'
  },
  {
    id: 'b3',
    name: 'Pinnacle Renovation Co.',
    phone: '+1 309-555-0111',
    address: '789 Pine Rd, Peoria',
    city: 'Peoria',
    district: 'Peoria',
    state: 'Illinois',
    category: 'Home Renovations',
    rating: 4.2,
    website: 'https://pinnaclerenovations.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Pinnacle+Renovations+Peoria',
    notes: 'Experts in kitchen, bathroom, and basement remodeling.'
  },
  {
    id: 'b4',
    name: 'Greenstone Eco Homes',
    phone: '+1 309-555-0177',
    address: '101 Maple Ln, Bloomington',
    city: 'Bloomington',
    district: 'McLean',
    state: 'Illinois',
    category: 'Eco Builders',
    rating: 4.9,
    website: 'https://greenstonehomes.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Greenstone+Eco+Homes+Bloomington',
    notes: 'Net-zero energy home specialists. Highly recommended.'
  },
  {
    id: 'b5',
    name: 'Apex Infrastructure Group',
    phone: '+1 217-555-0188',
    address: '222 Industrial Pkwy, Decatur',
    city: 'Decatur',
    district: 'Macon',
    state: 'Illinois',
    category: 'Infrastructure',
    rating: 4.6,
    website: 'https://apexinfra.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Apex+Infrastructure+Decatur',
    notes: 'Bridges, roads, and large scale municipal civil engineering projects.'
  },
  {
    id: 'b6',
    name: 'Lone Star Steel & Concrete',
    phone: '+1 512-555-0210',
    address: '808 Tech Ridge Blvd, Austin',
    city: 'Austin',
    district: 'Travis',
    state: 'Texas',
    category: 'Industrial Builders',
    rating: 4.7,
    website: 'https://lonestarsteel.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Lone+Star+Steel+Austin',
    notes: 'Pre-fabricated steel structures and heavy foundation work.'
  },
  {
    id: 'b7',
    name: 'Gulf Coast Developers',
    phone: '+1 713-555-0322',
    address: '1200 Marina Way, Houston',
    city: 'Houston',
    district: 'Harris',
    state: 'Texas',
    category: 'Residential Builders',
    rating: 4.4,
    website: 'https://gulfcoastdev.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Gulf+Coast+Developers+Houston',
    notes: 'Coastal-resilient home builders and multi-family complexes.'
  },
  {
    id: 'b8',
    name: 'Metroplex Design Build',
    phone: '+1 214-555-0455',
    address: '500 Plaza Center, Dallas',
    city: 'Dallas',
    district: 'Dallas',
    state: 'Texas',
    category: 'Commercial Contractors',
    rating: 4.7,
    website: 'https://metroplexdesign.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Metroplex+Design+Dallas',
    notes: 'Architect-led design-build firm focusing on high-rise spaces.'
  },
  {
    id: 'b9',
    name: 'Cascade Woodworks & Framing',
    phone: '+1 206-555-0980',
    address: '1540 Forestry Rd, Seattle',
    city: 'Seattle',
    district: 'King',
    state: 'Washington',
    category: 'Carpentry & Framing',
    rating: 4.8,
    website: 'https://cascadewoodworks.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Cascade+Woodworks+Seattle',
    notes: 'Sub-contractor specialized in high-end structural timber framing.'
  },
  {
    id: 'b10',
    name: 'Evergreen Civil Contractors',
    phone: '+1 509-555-0811',
    address: '990 Spokane River Dr, Spokane',
    city: 'Spokane',
    district: 'Spokane',
    state: 'Washington',
    category: 'Infrastructure',
    rating: 4.3,
    website: 'https://evergreencivil.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Evergreen+Civil+Spokane',
    notes: 'Excavation, utility hookups, and site preparation specialists.'
  },
  {
    id: 'b11',
    name: 'Sri Vignesh Construction',
    phone: '+91 9443210190',
    address: '12, Gandhipuram 4th Street, Coimbatore',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    category: 'Residential Builders',
    rating: 4.7,
    website: 'https://vigneshbuilders.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Gandhipuram+Coimbatore',
    notes: 'Premium independent villa and multi-storey apartment developers.'
  },
  {
    id: 'b12',
    name: 'Karthik Commercials Ltd',
    phone: '+91 9840123456',
    address: '45, Usman Road, T. Nagar, Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    category: 'Commercial Contractors',
    rating: 4.6,
    website: 'https://karthikcomm.example.com',
    googleMapsLink: 'https://maps.google.com/?q=T.Nagar+Chennai',
    notes: 'Specialists in IT parks, shopping complexes and commercial high-rises.'
  },
  {
    id: 'b13',
    name: 'Pandiyan Infrastructure',
    phone: '+91 9655512121',
    address: '102, Madurai Ring Road, KK Nagar, Madurai',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    category: 'Infrastructure',
    rating: 4.4,
    website: 'https://pandiyaninfra.example.com',
    googleMapsLink: 'https://maps.google.com/?q=KK.Nagar+Madurai',
    notes: 'Government contractors for state highway structures and bridges.'
  },
  {
    id: 'b14',
    name: 'Cauvery Eco Homes',
    phone: '+91 9789012345',
    address: '88, Rockfort View Road, Cantonment, Trichy',
    city: 'Trichy',
    district: 'Trichy',
    state: 'Tamil Nadu',
    category: 'Eco Builders',
    rating: 4.8,
    website: 'https://cauveryeco.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Cantonment+Trichy',
    notes: 'Sustainable clay block work, solar installations, and green energy buildings.'
  },
  {
    id: 'b15',
    name: 'Salem Steel Structural Works',
    phone: '+91 9944556677',
    address: '202, Meyyanur Bypass Road, Salem',
    city: 'Salem',
    district: 'Salem',
    state: 'Tamil Nadu',
    category: 'Industrial Builders',
    rating: 4.5,
    website: 'https://salemsteel.example.com',
    googleMapsLink: 'https://maps.google.com/?q=Meyyanur+Salem',
    notes: 'Heavy structural steel fabrication, warehouse design, and roofings.'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'lead_1',
    name: 'Robert Carter',
    company: 'Alpha Builders & Developers',
    phone: '+1 217-555-0190',
    address: '123 Main St, Springfield',
    city: 'Springfield',
    state: 'Illinois',
    notes: 'Met at Construction Expo. Interested in sub-contracting HVAC services.',
    status: 'new',
    priority: 'high',
    followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
    tags: ['Expo 2026', 'Residential', 'HVAC'],
    favorite: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    id: 'lead_2',
    name: 'Sarah Jenkins',
    company: 'Summit Commercial Construction',
    phone: '+1 312-555-0143',
    address: '456 Commerce Ave, Chicago',
    city: 'Chicago',
    state: 'Illinois',
    notes: 'Follow up on the bid for the downtown office retail complex. Sent initial email pricing brochure.',
    status: 'pending',
    priority: 'medium',
    followUpDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], // tomorrow
    tags: ['Commercial', 'Office Project'],
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
  },
  {
    id: 'lead_3',
    name: 'Michael Miller',
    company: 'Greenstone Eco Homes',
    phone: '+1 309-555-0177',
    address: '101 Maple Ln, Bloomington',
    city: 'Bloomington',
    state: 'Illinois',
    notes: 'Spoke on phone. Very excited about green energy products. Scheduled demo.',
    status: 'contacted',
    priority: 'high',
    followUpDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // 4 days from now
    tags: ['Eco Friendly', 'Demo Scheduled'],
    favorite: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    id: 'lead_4',
    name: 'David Vance',
    company: 'Apex Infrastructure Group',
    phone: '+1 217-555-0188',
    address: '222 Industrial Pkwy, Decatur',
    city: 'Decatur',
    state: 'Illinois',
    notes: 'Discussed steel framing supply contract. Budget approved, waiting on draft agreement signing.',
    status: 'closed',
    priority: 'high',
    followUpDate: '',
    tags: ['Industrial', 'Closed Deal'],
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString() // 15 days ago
  },
  {
    id: 'lead_5',
    name: 'Samantha Lopez',
    company: 'Pinnacle Renovation Co.',
    phone: '+1 309-555-0111',
    address: '789 Pine Rd, Peoria',
    city: 'Peoria',
    state: 'Illinois',
    notes: 'Left message. No response yet. Follow up on Tuesday.',
    status: 'new',
    priority: 'low',
    followUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    tags: ['Renovation', 'Cold Outreach'],
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString() // yesterday
  }
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Nagarajan',
    email: 'admin@constructioncrm.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastActive: new Date().toISOString()
  },
  {
    id: 'u2',
    name: 'Jane Doe',
    email: 'jane@constructioncrm.com',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hrs ago
  },
  {
    id: 'u3',
    name: 'Mark Davis',
    email: 'mark@constructioncrm.com',
    role: 'user',
    status: 'suspended',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastActive: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log_1',
    userId: 'u1',
    userName: 'Nagarajan',
    action: 'Added Lead',
    target: 'Robert Carter (Alpha Builders & Developers)',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hrs ago
  },
  {
    id: 'log_2',
    userId: 'u2',
    userName: 'Jane Doe',
    action: 'Updated Lead Status',
    target: 'Sarah Jenkins (Summit Commercial) to Pending',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'log_3',
    userId: 'u1',
    userName: 'Nagarajan',
    action: 'Exported Leads',
    target: 'Excel Export (5 records)',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'log_4',
    userId: 'u1',
    userName: 'Nagarajan',
    action: 'Changed Setting',
    target: 'System backup triggered successfully',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockCategories = [
  'Construction Builder',
  'Hardware Shop',
  'Cement Dealer',
  'Electrical Store',
  'Paint Shop',
  'Tiles Showroom',
  'Steel & Concrete',
  'Home Renovations',
  'Infrastructure'
];
