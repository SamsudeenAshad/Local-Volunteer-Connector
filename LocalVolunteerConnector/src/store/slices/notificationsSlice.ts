// Notifications slice for managing app notifications
// Created by Samsudeen Ashad

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationType } from '../../types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Mock data for initial development
const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user1',
    title: 'New Event Available',
    body: 'Emergency Food Distribution event needs volunteers urgently!',
    type: NotificationType.EVENT_INVITATION,
    data: { eventId: '2' },
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'notif2',
    userId: 'user1',
    title: 'Event Reminder',
    body: 'Beach Cleanup Drive starts tomorrow at 9:00 AM',
    type: NotificationType.EVENT_REMINDER,
    data: { eventId: '1' },
    isRead: false,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'notif3',
    userId: 'user1',
    title: 'New Message',
    body: 'Sarah Johnson sent you a message in Beach Cleanup Volunteers',
    type: NotificationType.MESSAGE,
    data: { roomId: 'room1' },
    isRead: true,
    createdAt: new Date(Date.now() - 10800000),
  },
];

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string) => {
    // This will be implemented with Firebase Firestore
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockNotifications;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    // This will be implemented with Firebase Firestore
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId: string) => {
    // This will be implemented with Firebase Firestore
    return userId;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    // This will be implemented with Firebase Firestore
    return notificationId;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      });
  },
});

export const { addNotification, clearError, updateUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
