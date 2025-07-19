export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  assets: Asset[];
  createdAt: Date;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'milestone' | 'event' | 'achievement';
  assets: Asset[];
  location?: string;
}

export interface BlockchainRecord {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: Date;
  data: unknown;
  nonce: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}