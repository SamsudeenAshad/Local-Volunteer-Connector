import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { RootState, AppDispatch } from '../../store';
import { fetchChatRooms, createChatRoom } from '../../store/slices/chatSlice';
import { ChatRoom, ChatRoomType } from '../../types';

interface ChatRoomCardProps {
  room: ChatRoom;
  onPress: () => void;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ room, onPress }) => {
  const getLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoomIcon = () => {
    switch (room.type) {
      case ChatRoomType.EVENT:
        return 'event';
      case ChatRoomType.DIRECT:
        return 'person';
      case ChatRoomType.GROUP:
        return 'group';
      default:
        return 'chat';
    }
  };

  const getRoomTypeColor = () => {
    switch (room.type) {
      case ChatRoomType.EVENT:
        return Colors.primary;
      case ChatRoomType.DIRECT:
        return Colors.secondary;
      case ChatRoomType.GROUP:
        return Colors.accent;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.roomCard} onPress={onPress}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <View style={[styles.roomIconContainer, { backgroundColor: getRoomTypeColor() + '20' }]}>
            <Icon name={getRoomIcon()} size={20} color={getRoomTypeColor()} />
          </View>
          <View style={styles.roomDetails}>
            <Text style={styles.roomName} numberOfLines={1}>
              {room.name}
            </Text>
            <Text style={styles.roomType}>
              {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • {room.participantCount} members
            </Text>
          </View>
        </View>
        <View style={styles.roomMeta}>
          <Text style={styles.lastMessageTime}>
            {room.lastMessage ? getLastMessageTime(room.lastMessage.timestamp) : ''}
          </Text>
          {room.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      {room.lastMessage && (
        <Text style={styles.lastMessage} numberOfLines={2}>
          {room.lastMessage.senderId !== 'current-user' && `${room.lastMessage.senderName}: `}
          {room.lastMessage.content}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const ChatScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { chatRooms, loading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ChatRoomType | 'all'>('all');

  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  const filters = [
    { key: 'all', label: 'All Chats', icon: 'chat' },
    { key: ChatRoomType.EVENT, label: 'Events', icon: 'event' },
    { key: ChatRoomType.GROUP, label: 'Groups', icon: 'group' },
    { key: ChatRoomType.DIRECT, label: 'Direct', icon: 'person' },
  ];

  const filteredRooms = chatRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || room.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedFilter === filter.key && styles.filterButtonSelected
          ]}
          onPress={() => setSelectedFilter(filter.key as ChatRoomType | 'all')}
        >
          <Icon 
            name={filter.icon} 
            size={16} 
            color={selectedFilter === filter.key ? Colors.white : Colors.textSecondary} 
          />
          <Text style={[
            styles.filterButtonText,
            selectedFilter === filter.key && styles.filterButtonTextSelected
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Connect with volunteers</Text>
        </View>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={() => navigation.navigate('CreateChatRoom' as never)}
        >
          <Icon name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="clear" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {renderFilterBar()}
    </View>
  );

  if (loading && chatRooms.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRoomCard 
            room={item}
            onPress={() => navigation.navigate('ChatRoom' as never, { roomId: item.id } as never)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => dispatch(fetchChatRooms())}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chat" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start chatting with fellow volunteers
            </Text>
            <TouchableOpacity 
              style={styles.startChatButton}
              onPress={() => navigation.navigate('CreateChatRoom' as never)}
            >
              <Text style={styles.startChatButtonText}>Start a conversation</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  newChatButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  filterButtonTextSelected: {
    color: Colors.white,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  roomCard: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  roomDetails: {
    flex: 1,
  },
  roomName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roomType: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  lastMessageTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  unreadBadge: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  lastMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  startChatButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  startChatButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default ChatScreen;
