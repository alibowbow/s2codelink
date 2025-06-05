export interface User {
  id: string;
  username: string;
  displayName: string;
  friendCode: string;
  avatar?: string;
  bio?: string;
  games: string[];
  age?: number;
  region?: string;
  followers: string[];
  following: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  game?: string;
  ageGroup?: AgeGroup;
  memberCount: number;
  members: string[];
  admins: string[];
  avatar?: string;
  createdAt: Date;
  isPrivate: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  communityId?: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface GameSession {
  id: string;
  hostId: string;
  communityId?: string;
  game: string;
  title: string;
  description?: string;
  startTime: Date;
  duration: number;
  maxPlayers: number;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  price?: number;
  images: string[];
  location?: string;
  status: 'active' | 'sold' | 'reserved';
  createdAt: Date;
}

export type CommunityCategory = 'game' | 'age' | 'region' | 'language' | 'competitive' | 'casual' | 'other';
export type AgeGroup = 'kids' | 'teens' | 'adults' | 'all';
export type MarketplaceCategory = 'games' | 'consoles' | 'accessories' | 'collectibles' | 'other';