import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { Button } from '../../components/Button';
import { RootState, AppDispatch } from '../../store';
import { joinEvent, leaveEvent, saveEvent, unsaveEvent } from '../../store/slices/eventsSlice';
import { VolunteerEvent, EventCategory, EventType } from '../../types';

interface RouteParams {
  eventId: string;
}

const EventDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { eventId } = route.params as RouteParams;
  const { events, joinedEvents, savedEvents } = useSelector((state: RootState) => state.events);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const foundEvent = events.find(e => e.id === eventId);
    setEvent(foundEvent || null);
  }, [eventId, events]);

  const isJoined = joinedEvents.includes(eventId);
  const isSaved = savedEvents.includes(eventId);
  const isOrganizer = event?.organizerId === user?.id;
  const spotsAvailable = event ? event.maxVolunteers - event.currentVolunteers : 0;
  const canJoin = spotsAvailable > 0 && !isJoined && !isOrganizer;

  const handleJoinEvent = async () => {
    if (!event) return;
    
    try {
      setLoading(true);
      await dispatch(joinEvent(eventId)).unwrap();
      Alert.alert('Success', 'You have successfully joined this event!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = () => {
    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await dispatch(leaveEvent(eventId)).unwrap();
              Alert.alert('Success', 'You have left the event.');
            } catch (error) {
              Alert.alert('Error', 'Failed to leave event. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveEvent = async () => {
    try {
      if (isSaved) {
        await dispatch(unsaveEvent(eventId)).unwrap();
      } else {
        await dispatch(saveEvent(eventId)).unwrap();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update saved events.');
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    
    try {
      await Share.share({
        message: `Check out this volunteer opportunity: ${event.title}\n\n${event.description}\n\nLocation: ${event.location}\nDate: ${new Date(event.date).toLocaleDateString()}`,
        title: event.title,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleContactOrganizer = () => {
    navigation.navigate('ChatRoom' as never, { 
      roomId: `event-${eventId}`,
      roomName: `${event?.title} - Discussion`
    } as never);
  };

  const getCategoryColor = () => {
    if (!event) return Colors.primary;
    
    switch (event.category) {
      case EventCategory.DISASTER_RELIEF:
        return Colors.error;
      case EventCategory.COMMUNITY_SERVICE:
        return Colors.primary;
      case EventCategory.ENVIRONMENTAL:
        return Colors.success;
      case EventCategory.EDUCATION:
        return Colors.secondary;
      case EventCategory.HEALTHCARE:
        return Colors.accent;
      case EventCategory.SENIOR_CARE:
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const getUrgencyLevel = () => {
    if (!event) return 'Normal';
    
    const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const fillPercentage = (event.currentVolunteers / event.maxVolunteers) * 100;
    
    if (event.category === EventCategory.DISASTER_RELIEF) {
      return 'Critical';
    } else if (daysUntilEvent <= 3 || fillPercentage < 30) {
      return 'High';
    } else if (daysUntilEvent <= 7 || fillPercentage < 60) {
      return 'Medium';
    }
    return 'Normal';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleSaveEvent}
        >
          <Icon 
            name={isSaved ? "bookmark" : "bookmark-border"} 
            size={24} 
            color={Colors.white} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleShareEvent}
        >
          <Icon name="share" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEventImage = () => (
    <View style={styles.imageContainer}>      <Image
        source={
          event?.image 
            ? { uri: event.image }
            : { uri: 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Volunteer+Event' }
        }
        style={styles.eventImage}
      />
      <View style={styles.imageOverlay}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
          <Text style={styles.categoryText}>
            {event?.category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>
        
        <View style={[styles.urgencyBadge, { 
          backgroundColor: getUrgencyLevel() === 'Critical' ? Colors.error : 
                          getUrgencyLevel() === 'High' ? Colors.warning : 
                          getUrgencyLevel() === 'Medium' ? Colors.secondary : Colors.success
        }]}>
          <Text style={styles.urgencyText}>
            {getUrgencyLevel()} Priority
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEventInfo = () => (
    <View style={styles.eventInfo}>
      <Text style={styles.eventTitle}>{event?.title}</Text>
      <Text style={styles.eventDescription}>{event?.description}</Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Icon name="event" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            {event ? new Date(event.date).toLocaleDateString() : ''}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="access-time" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            {event ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="location-on" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>{event?.location}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="people" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            {event?.currentVolunteers}/{event?.maxVolunteers} volunteers
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="repeat" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            {event?.type.charAt(0).toUpperCase() + event?.type.slice(1)} event
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="accessibility" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            {event?.requirements || 'No special requirements'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOrganizerInfo = () => (
    <View style={styles.organizerSection}>
      <Text style={styles.sectionTitle}>Event Organizer</Text>
      <View style={styles.organizerCard}>
        <Image
          source={
            event?.organizerImage 
              ? { uri: event.organizerImage }
              : require('../../assets/images/default-avatar.png')
          }
          style={styles.organizerImage}
        />
        <View style={styles.organizerInfo}>
          <Text style={styles.organizerName}>{event?.organizerName}</Text>
          <Text style={styles.organizerRole}>Event Organizer</Text>
          <View style={styles.organizerStats}>
            <Text style={styles.organizerStat}>
              {event?.organizerRating || 5.0} ⭐ • {event?.organizerEventsOrganized || 1} events
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactOrganizer}
        >
          <Icon name="chat" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVolunteers = () => (
    <View style={styles.volunteersSection}>
      <Text style={styles.sectionTitle}>
        Volunteers ({event?.currentVolunteers || 0})
      </Text>
      {event?.volunteers && event.volunteers.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.volunteersContainer}>
            {event.volunteers.map((volunteer, index) => (
              <View key={index} style={styles.volunteerCard}>
                <Image
                  source={
                    volunteer.profilePicture 
                      ? { uri: volunteer.profilePicture }
                      : require('../../assets/images/default-avatar.png')
                  }
                  style={styles.volunteerImage}
                />
                <Text style={styles.volunteerName} numberOfLines={1}>
                  {volunteer.name}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.noVolunteersText}>
          Be the first volunteer to join this event!
        </Text>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {isOrganizer ? (
        <View style={styles.organizerActions}>
          <Button
            title="Edit Event"
            onPress={() => navigation.navigate('EditEvent' as never, { eventId } as never)}
            style={styles.actionButton}
          />
          <Button
            title="Manage Volunteers"
            onPress={() => navigation.navigate('ManageVolunteers' as never, { eventId } as never)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      ) : (
        <View style={styles.volunteerActions}>
          {isJoined ? (
            <Button
              title="Leave Event"
              onPress={handleLeaveEvent}
              variant="outline"
              loading={loading}
              style={[styles.actionButton, { borderColor: Colors.error }]}
              textStyle={{ color: Colors.error }}
            />
          ) : (
            <Button
              title={canJoin ? "Join Event" : "Event Full"}
              onPress={handleJoinEvent}
              disabled={!canJoin}
              loading={loading}
              style={styles.actionButton}
            />
          )}
          
          <Button
            title="Contact Organizer"
            onPress={handleContactOrganizer}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      )}
    </View>
  );

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color={Colors.textSecondary} />
        <Text style={styles.errorTitle}>Event Not Found</Text>
        <Text style={styles.errorSubtitle}>
          This event may have been removed or doesn't exist.
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderEventImage()}
        {renderEventInfo()}
        {renderOrganizerInfo()}
        {renderVolunteers()}
      </ScrollView>
      
      {renderActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  goBackButton: {
    width: 150,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: Colors.black + '50',
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerActionButton: {
    backgroundColor: Colors.black + '50',
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  urgencyText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  eventInfo: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
  },
  eventTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  eventDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  infoGrid: {
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  organizerSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  organizerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
    marginRight: Spacing.md,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  organizerRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  organizerStats: {
    flexDirection: 'row',
  },
  organizerStat: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  contactButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteersSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  volunteersContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  volunteerCard: {
    alignItems: 'center',
    width: 70,
  },
  volunteerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  volunteerName: {
    ...Typography.caption,
    color: Colors.text,
    textAlign: 'center',
  },
  noVolunteersText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  organizerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  volunteerActions: {
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default EventDetailsScreen;
