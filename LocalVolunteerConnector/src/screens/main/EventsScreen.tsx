import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { EventCard } from '../../components/EventCard';
import { RootState, AppDispatch } from '../../store';
import { fetchEvents } from '../../store/slices/eventsSlice';
import { EventCategory, EventType } from '../../types';

const EventsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading } = useSelector((state: RootState) => state.events);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: EventCategory.DISASTER_RELIEF, label: 'Disaster Relief', icon: 'warning' },
    { key: EventCategory.COMMUNITY_SERVICE, label: 'Community', icon: 'people' },
    { key: EventCategory.ENVIRONMENTAL, label: 'Environmental', icon: 'eco' },
    { key: EventCategory.EDUCATION, label: 'Education', icon: 'school' },
    { key: EventCategory.HEALTHCARE, label: 'Healthcare', icon: 'local-hospital' },
    { key: EventCategory.SENIOR_CARE, label: 'Senior Care', icon: 'elderly' },
  ];

  const types = [
    { key: 'all', label: 'All Types' },
    { key: EventType.ONE_TIME, label: 'One-time' },
    { key: EventType.RECURRING, label: 'Recurring' },
    { key: EventType.ONGOING, label: 'Ongoing' },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.filterChip,
            selectedCategory === category.key && styles.filterChipSelected
          ]}
          onPress={() => setSelectedCategory(category.key as EventCategory | 'all')}
        >
          <Icon 
            name={category.icon} 
            size={16} 
            color={selectedCategory === category.key ? Colors.white : Colors.textSecondary} 
          />
          <Text style={[
            styles.filterChipText,
            selectedCategory === category.key && styles.filterChipTextSelected
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTypeFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.typeFilterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {types.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.typeChip,
            selectedType === type.key && styles.typeChipSelected
          ]}
          onPress={() => setSelectedType(type.key as EventType | 'all')}
        >
          <Text style={[
            styles.typeChipText,
            selectedType === type.key && styles.typeChipTextSelected
          ]}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Volunteer Events</Text>
      <Text style={styles.subtitle}>Find opportunities to make a difference</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
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

      {/* Filters */}
      {renderCategoryFilter()}
      {renderTypeFilter()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent' as never)}
        >
          <Icon name="add" size={16} color={Colors.white} />
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => navigation.navigate('EventDetails' as never, { eventId: item.id } as never)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => dispatch(fetchEvents())}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
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
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
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
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  typeFilterContainer: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingRight: Spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  filterChipTextSelected: {
    color: Colors.white,
  },
  typeChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  typeChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  typeChipTextSelected: {
    color: Colors.white,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  createButtonText: {
    ...Typography.caption,
    color: Colors.white,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: Spacing.xl,
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
  },
});

export default EventsScreen;
