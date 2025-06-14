import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { RootState, AppDispatch } from '../../store';
import { sendMessage, markMessagesAsRead } from '../../store/slices/chatSlice';
import { ChatMessage, MessageType } from '../../types';

interface RouteParams {
  roomId: string;
  roomName?: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showSender }) => {
  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageTypeIcon = () => {
    switch (message.type) {
      case MessageType.IMAGE:
        return 'image';
      case MessageType.FILE:
        return 'attach-file';
      case MessageType.LOCATION:
        return 'location-on';
      default:
        return null;
    }
  };

  return (
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      {!isOwn && showSender && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      
      <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        {message.type !== MessageType.TEXT && (
          <View style={styles.messageTypeHeader}>
            <Icon 
              name={getMessageTypeIcon()!} 
              size={16} 
              color={isOwn ? Colors.white : Colors.primary} 
            />
            <Text style={[styles.messageTypeText, { color: isOwn ? Colors.white : Colors.primary }]}>
              {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
            </Text>
          </View>
        )}
        
        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
          {message.content}
        </Text>
        
        <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
          {getMessageTime(message.timestamp)}
          {isOwn && (
            <Icon 
              name={message.read ? "done-all" : "done"} 
              size={12} 
              color={message.read ? Colors.primary : Colors.white + '80'} 
              style={styles.readIcon}
            />
          )}
        </Text>
      </View>
    </View>
  );
};

const ChatRoomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { roomId, roomName } = route.params as RouteParams;
  const { chatRooms } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const currentRoom = chatRooms.find(room => room.id === roomId);

  useEffect(() => {
    navigation.setOptions({
      title: roomName || currentRoom?.name || 'Chat',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ChatRoomInfo' as never, { roomId } as never)}
        >
          <Icon name="info" size={24} color={Colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, roomName, currentRoom]);

  useEffect(() => {
    // Load messages for this room
    loadMessages();
    
    // Mark messages as read
    if (currentRoom?.unreadCount > 0) {
      dispatch(markMessagesAsRead(roomId));
    }
  }, [roomId]);

  const loadMessages = () => {
    // Mock messages for development - replace with actual API call
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hey everyone! Looking forward to this volunteer event!',
        senderId: 'user1',
        senderName: 'John Doe',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: MessageType.TEXT,
        read: true,
      },
      {
        id: '2',
        content: 'Same here! What should we bring?',
        senderId: user?.id || 'current-user',
        senderName: user?.name || 'You',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        type: MessageType.TEXT,
        read: true,
      },
      {
        id: '3',
        content: 'Please bring gloves and comfortable shoes. We\'ll provide everything else!',
        senderId: 'organizer1',
        senderName: 'Event Organizer',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: MessageType.TEXT,
        read: false,
      },
      {
        id: '4',
        content: 'Perfect! See you all tomorrow at 9 AM.',
        senderId: 'user2',
        senderName: 'Jane Smith',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        type: MessageType.TEXT,
        read: false,
      },
    ];
    
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      timestamp: new Date().toISOString(),
      type: MessageType.TEXT,
      read: false,
    };

    try {
      setLoading(true);
      await dispatch(sendMessage({ roomId, message: newMessage })).unwrap();
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachment = () => {
    Alert.alert(
      'Send Attachment',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Location', onPress: () => console.log('Location selected') },
        { text: 'File', onPress: () => console.log('File selected') },
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === (user?.id || 'current-user');
    const previousMessage = messages[index - 1];
    const showSender = !isOwn && (!previousMessage || previousMessage.senderId !== item.senderId);
    
    return (
      <MessageBubble 
        message={item} 
        isOwn={isOwn} 
        showSender={showSender}
      />
    );
  };

  const renderInputArea = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.attachButton}
        onPress={handleAttachment}
      >
        <Icon name="attach-file" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
      
      <TextInput
        style={styles.messageInput}
        placeholder="Type a message..."
        placeholderTextColor={Colors.textSecondary}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={1000}
      />
      
      <TouchableOpacity
        style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
        onPress={handleSendMessage}
        disabled={!message.trim() || loading}
      >
        <Icon name="send" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderDateSeparator = (date: string) => (
    <View style={styles.dateSeparator}>
      <Text style={styles.dateText}>
        {new Date(date).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
      <Text style={styles.typingText}>Someone is typing...</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? renderTypingIndicator() : null}
      />
      
      {renderInputArea()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ownBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  otherBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  messageTypeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  messageText: {
    ...Typography.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: Colors.white + '80',
  },
  otherMessageTime: {
    color: Colors.textSecondary,
  },
  readIcon: {
    marginLeft: Spacing.xs,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  typingBubble: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingDots: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
  typingDot1: {
    // Animation would be added here
  },
  typingDot2: {
    // Animation would be added here
  },
  typingDot3: {
    // Animation would be added here
  },
  typingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  attachButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    ...Typography.body,
    color: Colors.text,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatRoomScreen;
