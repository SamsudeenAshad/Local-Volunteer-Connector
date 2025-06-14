// Events slice for volunteer events state management
// Created by Samsudeen Ashad

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { VolunteerEvent, EventCategory, EventStatus } from '../../types';

interface EventsState {
  events: VolunteerEvent[];
  myEvents: VolunteerEvent[];
  featuredEvents: VolunteerEvent[];
  isLoading: boolean;
  error: string | null;
  selectedEvent: VolunteerEvent | null;
}

const initialState: EventsState = {
  events: [],
  myEvents: [],
  featuredEvents: [],
  isLoading: false,
  error: null,
  selectedEvent: null,
};

// Mock data for initial development
const mockEvents: VolunteerEvent[] = [
  {
    id: '1',
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup to protect marine life and keep our beaches beautiful.',
    category: EventCategory.ENVIRONMENTAL,
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Central Park Beach, New York, NY',
    },
    startDate: new Date('2025-06-20T09:00:00'),
    endDate: new Date('2025-06-20T15:00:00'),
    requiredSkills: ['Physical Labor', 'Teamwork'],
    maxVolunteers: 50,
    currentVolunteers: 23,
    organizer: {
      id: 'org1',
      name: 'Green Earth Initiative',
      organization: 'Environmental NGO',
    },
    images: ['beach-cleanup-1.jpg', 'beach-cleanup-2.jpg'],
    isUrgent: false,
    status: EventStatus.UPCOMING,
    volunteers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Emergency Food Distribution',
    description: 'Urgent need for volunteers to help distribute food to families affected by recent flooding.',
    category: EventCategory.DISASTER_RELIEF,
    location: {
      latitude: 40.6782,
      longitude: -73.9442,
      address: 'Brooklyn Community Center, Brooklyn, NY',
    },
    startDate: new Date('2025-06-15T08:00:00'),
    endDate: new Date('2025-06-15T18:00:00'),
    requiredSkills: ['Organization', 'Physical Labor', 'Communication'],
    maxVolunteers: 30,
    currentVolunteers: 18,
    organizer: {
      id: 'org2',
      name: 'Red Cross NYC',
      organization: 'Disaster Relief',
    },
    images: ['food-distribution-1.jpg'],
    isUrgent: true,
    status: EventStatus.UPCOMING,
    volunteers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters?: { category?: EventCategory; location?: string }) => {
    // This will be implemented with Firebase Firestore
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return mockEvents;
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId: string) => {
    // This will be implemented with Firebase Firestore
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');
    return event;
  }
);

export const joinEvent = createAsyncThunk(
  'events/joinEvent',
  async ({ eventId, userId }: { eventId: string; userId: string }) => {
    // This will be implemented with Firebase Firestore
    return { eventId, userId };
  }
);

export const leaveEvent = createAsyncThunk(
  'events/leaveEvent',
  async ({ eventId, userId }: { eventId: string; userId: string }) => {
    // This will be implemented with Firebase Firestore
    return { eventId, userId };
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEvent: (state, action: PayloadAction<VolunteerEvent | null>) => {
      state.selectedEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.featuredEvents = action.payload.filter(event => event.isUrgent).slice(0, 3);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })
      // Fetch event by ID
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
      })
      // Join event
      .addCase(joinEvent.fulfilled, (state, action) => {
        const event = state.events.find(e => e.id === action.payload.eventId);
        if (event) {
          event.currentVolunteers += 1;
          event.volunteers.push(action.payload.userId);
        }
      })
      // Leave event
      .addCase(leaveEvent.fulfilled, (state, action) => {
        const event = state.events.find(e => e.id === action.payload.eventId);
        if (event) {
          event.currentVolunteers -= 1;
          event.volunteers = event.volunteers.filter(id => id !== action.payload.userId);
        }
      });
  },
});

export const { clearError, setSelectedEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
