// Home Screen - Main dashboard
// Created by Samsudeen Ashad

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { MainTabParamList, RootStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchEvents } from '../../store/slices/eventsSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import EventCard from '../../components/EventCard';
import Button from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../utils/theme';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { events, featuredEvents, isLoading } = useSelector((state: RootState) => state.events);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (user) {
      await Promise.all([
        dispatch(fetchEvents()),
        dispatch(fetchNotifications(user.id)),
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      icon: 'search',
      title: 'Find Events',
      subtitle: 'Discover volunteer opportunities',
      onPress: () => navigation.navigate('Events'),
      color: Colors.primary,
    },
    {
      icon: 'add',
      title: 'Create Event',
      subtitle: 'Organize a volunteer activity',
      onPress: () => navigation.navigate('CreateEvent'),
      color: Colors.secondary,
    },
    {
      icon: 'chat',
      title: 'Messages',
      subtitle: 'Connect with volunteers',
      onPress: () => navigation.navigate('Chat'),
      color: Colors.accent,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: 'map',
      title: 'Event Map',
      subtitle: 'View events near you',
      onPress: () => navigation.navigate('Map'),
      color: Colors.info,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Volunteer'}!</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => {
                // TODO: Navigate to notifications screen
              }}>
              <Icon name="notifications" size={24} color={Colors.surface} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.volunteerHours || 0}</Text>
              <Text style={styles.statLabel}>Hours Volunteered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{events.filter(e => e.volunteers.includes(user?.id || '')).length}</Text>
              <Text style={styles.statLabel}>Events Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.badges?.length || 0}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}>
                <View style={styles.quickActionHeader}>
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <Icon name={action.icon} size={24} color={Colors.surface} />
                  </View>
                  {action.badge && (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Urgent Events</Text>
              <Button
                title="View All"
                variant="text"
                size="small"
                onPress={() => navigation.navigate('Events')}
              />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}>
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="compact"
                  onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            <Button
              title="View All"
              variant="text"
              size="small"
              onPress={() => navigation.navigate('Events')}
            />
          </View>
          {events.slice(0, 3).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
            />
          ))}
        </View>

        {/* Community Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Together We've Made a Difference</Text>
            <View style={styles.impactStats}>
              <View style={styles.impactStat}>
                <Text style={styles.impactNumber}>1,234</Text>
                <Text style={styles.impactLabel}>Total Volunteers</Text>
              </View>
              <View style={styles.impactStat}>
                <Text style={styles.impactNumber}>5,678</Text>
                <Text style={styles.impactLabel}>Hours Contributed</Text>
              </View>
              <View style={styles.impactStat}>
                <Text style={styles.impactNumber}>89</Text>
                <Text style={styles.impactLabel}>Events Completed</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.md,
    color: Colors.surface,
    opacity: 0.9,
  },
  userName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: Colors.surface,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.surface,
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: (width - Spacing.lg * 2 - Spacing.sm) / 2,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    ...Shadows.small,
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: Colors.surface,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  quickActionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  horizontalScroll: {
    paddingLeft: 0,
    paddingRight: Spacing.sm,
  },
  impactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  impactTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  impactLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default HomeScreen;
