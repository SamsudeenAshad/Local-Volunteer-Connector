// Event Card component
// Created by Samsudeen Ashad

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VolunteerEvent, EventCategory } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../utils/theme';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: VolunteerEvent;
  onPress: () => void;
  variant?: 'full' | 'compact';
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  variant = 'full',
}) => {
  const getCategoryIcon = (category: EventCategory): string => {
    switch (category) {
      case EventCategory.DISASTER_RELIEF:
        return 'warning';
      case EventCategory.ENVIRONMENTAL:
        return 'eco';
      case EventCategory.COMMUNITY_SERVICE:
        return 'people';
      case EventCategory.EDUCATION:
        return 'school';
      case EventCategory.HEALTHCARE:
        return 'local-hospital';
      case EventCategory.ELDERLY_CARE:
        return 'elderly';
      case EventCategory.ANIMAL_WELFARE:
        return 'pets';
      case EventCategory.FOOD_SECURITY:
        return 'restaurant';
      case EventCategory.HOMELESS_SUPPORT:
        return 'home';
      case EventCategory.YOUTH_PROGRAMS:
        return 'child-care';
      default:
        return 'event';
    }
  };

  const getCategoryColor = (category: EventCategory): string => {
    switch (category) {
      case EventCategory.DISASTER_RELIEF:
        return Colors.error;
      case EventCategory.ENVIRONMENTAL:
        return Colors.secondary;
      case EventCategory.COMMUNITY_SERVICE:
        return Colors.primary;
      case EventCategory.EDUCATION:
        return Colors.info;
      case EventCategory.HEALTHCARE:
        return '#E74C3C';
      case EventCategory.ELDERLY_CARE:
        return '#9B59B6';
      case EventCategory.ANIMAL_WELFARE:
        return '#F39C12';
      case EventCategory.FOOD_SECURITY:
        return '#E67E22';
      case EventCategory.HOMELESS_SUPPORT:
        return '#34495E';
      case EventCategory.YOUTH_PROGRAMS:
        return '#FF69B4';
      default:
        return Colors.primary;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCategory = (category: EventCategory): string => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const volunteersNeeded = event.maxVolunteers - event.currentVolunteers;
  const participationRate = (event.currentVolunteers / event.maxVolunteers) * 100;

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress}>
        <View style={styles.compactHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
            <Icon name={getCategoryIcon(event.category)} size={16} color={Colors.surface} />
          </View>
          {event.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.compactLocation} numberOfLines={1}>
          <Icon name="location-on" size={14} color={Colors.textSecondary} />
          {' '}{event.location.address}
        </Text>
        <Text style={styles.compactDate}>
          {formatDate(event.startDate)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.images[0] || 'https://via.placeholder.com/300x200?text=Event+Image' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
            <Icon name={getCategoryIcon(event.category)} size={16} color={Colors.surface} />
            <Text style={styles.categoryText}>{formatCategory(event.category)}</Text>
          </View>
          {event.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={3}>
          {event.description}
        </Text>

        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location.address}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="schedule" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            {formatDate(event.startDate)}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.volunteersInfo}>
            <Text style={styles.volunteersCount}>
              {event.currentVolunteers}/{event.maxVolunteers} volunteers
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(participationRate, 100)}%`,
                    backgroundColor: participationRate >= 80 ? Colors.warning : Colors.secondary,
                  }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.organizerText}>
            by {event.organizer.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  compactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    width: width * 0.7,
    ...Shadows.small,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    color: Colors.surface,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginLeft: 4,
  },
  urgentBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  urgentText: {
    color: Colors.surface,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  footer: {
    marginTop: Spacing.sm,
  },
  volunteersInfo: {
    marginBottom: Spacing.xs,
  },
  volunteersCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  organizerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  compactTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  compactLocation: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  compactDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
});

export default EventCard;
