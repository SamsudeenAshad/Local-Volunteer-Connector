// Chat slice for messaging state management
// Created by Samsudeen Ashad

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatRoom, ChatRoomType, MessageType } from '../../types';

interface ChatState {
  chatRooms: ChatRoom[];
  messages: { [roomId: string]: ChatMessage[] };
  isLoading: boolean;
  error: string | null;
  activeRoom: string | null;
}

const initialState: ChatState = {
  chatRooms: [],
  messages: {},
  isLoading: false,
  error: null,
  activeRoom: null,
};

// Mock data for initial development
const mockChatRooms: ChatRoom[] = [
  {
    id: 'room1',
    name: 'Beach Cleanup Volunteers',
    type: ChatRoomType.EVENT,
    participants: ['user1', 'user2', 'user3'],
    eventId: '1',
    lastMessage: {
      id: 'msg1',
      senderId: 'user2',
      senderName: 'Sarah Johnson',
      content: 'Looking forward to the cleanup tomorrow!',
      timestamp: new Date(),
      type: MessageType.TEXT,
      isRead: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'room2',
    name: 'Emergency Response Team',
    type: ChatRoomType.EMERGENCY,
    participants: ['user1', 'org1', 'user4'],
    lastMessage: {
      id: 'msg2',
      senderId: 'org1',
      senderName: 'Emergency Coordinator',
      content: 'All volunteers please report to the distribution center',
      timestamp: new Date(),
      type: MessageType.TEXT,
      isRead: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId: string) => {
    // This will be implemented with Firebase Firestore
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChatRooms;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (roomId: string) => {
    // This will be implemented with Firebase Firestore
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg1',
        senderId: 'user1',
        senderName: 'You',
        content: 'Hi everyone! Excited to help with the beach cleanup.',
        timestamp: new Date(Date.now() - 3600000),
        type: MessageType.TEXT,
        isRead: true,
      },
      {
        id: 'msg2',
        senderId: 'user2',
        senderName: 'Sarah Johnson',
        content: 'Great to have you on board! Don\'t forget to bring gloves.',
        timestamp: new Date(Date.now() - 1800000),
        type: MessageType.TEXT,
        isRead: true,
      },
      {
        id: 'msg3',
        senderId: 'user3',
        senderName: 'Mike Chen',
        content: 'I\'ll bring extra trash bags for everyone.',
        timestamp: new Date(Date.now() - 900000),
        type: MessageType.TEXT,
        isRead: true,
      },
    ];
    return { roomId, messages: mockMessages };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({
    roomId,
    senderId,
    senderName,
    content,
    type = MessageType.TEXT,
  }: {
    roomId: string;
    senderId: string;
    senderName: string;
    content: string;
    type?: MessageType;
  }) => {
    // This will be implemented with Socket.io and Firebase
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      type,
      isRead: false,
    };
    return { roomId, message };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoom = action.payload;
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].map(msg => ({
          ...msg,
          isRead: true,
        }));
      }
    },
    addMessage: (state, action: PayloadAction<{ roomId: string; message: ChatMessage }>) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
      
      // Update last message in chat room
      const room = state.chatRooms.find(r => r.id === roomId);
      if (room) {
        room.lastMessage = message;
        room.updatedAt = new Date();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatRooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch chat rooms';
      })
      // Fetch messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        state.messages[roomId] = messages;
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { roomId, message } = action.payload;
        if (!state.messages[roomId]) {
          state.messages[roomId] = [];
        }
        state.messages[roomId].push(message);
        
        // Update last message in chat room
        const room = state.chatRooms.find(r => r.id === roomId);
        if (room) {
          room.lastMessage = message;
          room.updatedAt = new Date();
        }
      });
  },
});

export const { setActiveRoom, markMessagesAsRead, addMessage, clearError } = chatSlice.actions;
export default chatSlice.reducer;
