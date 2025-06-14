// Type definitions for Local Volunteer Connector
// Created by Samsudeen Ashad

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  skills: string[];
  interests: string[];
  volunteerHours: number;
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  startDate: Date;
  endDate: Date;
  requiredSkills: string[];
  maxVolunteers: number;
  currentVolunteers: number;
  organizer: {
    id: string;
    name: string;
    organization?: string;
  };
  images: string[];
  isUrgent: boolean;
  status: EventStatus;
  volunteers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: MessageType;
  attachments?: string[];
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  participants: string[];
  lastMessage?: ChatMessage;
  eventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  earnedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// Enums
export enum EventCategory {
  DISASTER_RELIEF = 'disaster_relief',
  COMMUNITY_SERVICE = 'community_service',
  ENVIRONMENTAL = 'environmental',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  ELDERLY_CARE = 'elderly_care',
  ANIMAL_WELFARE = 'animal_welfare',
  FOOD_SECURITY = 'food_security',
  HOMELESS_SUPPORT = 'homeless_support',
  YOUTH_PROGRAMS = 'youth_programs',
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  LOCATION = 'location',
  SYSTEM = 'system',
}

export enum ChatRoomType {
  EVENT = 'event',
  DIRECT = 'direct',
  GROUP = 'group',
  EMERGENCY = 'emergency',
}

export enum NotificationType {
  EVENT_INVITATION = 'event_invitation',
  EVENT_UPDATE = 'event_update',
  EVENT_REMINDER = 'event_reminder',
  MESSAGE = 'message',
  BADGE_EARNED = 'badge_earned',
  EMERGENCY_ALERT = 'emergency_alert',
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventDetails: { eventId: string };
  Chat: { roomId: string };
  Profile: { userId?: string };
  CreateEvent: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Chat: undefined;
  Profile: undefined;
  Map: undefined;
};
