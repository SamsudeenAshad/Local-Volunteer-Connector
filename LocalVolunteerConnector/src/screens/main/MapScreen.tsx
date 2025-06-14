import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { EventCard } from '../../components/EventCard';
import { RootState, AppDispatch } from '../../store';
import { fetchEvents } from '../../store/slices/eventsSlice';
import { VolunteerEvent, EventCategory } from '../../types';

const { width, height } = Dimensions.get('window');

interface EventMarkerProps {
  event: VolunteerEvent;
  onPress: () => void;
}

const EventMarker: React.FC<EventMarkerProps> = ({ event, onPress }) => {
  const getMarkerColor = () => {
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

  const getMarkerIcon = () => {
    switch (event.category) {
      case EventCategory.DISASTER_RELIEF:
        return 'warning';
      case EventCategory.COMMUNITY_SERVICE:
        return 'people';
      case EventCategory.ENVIRONMENTAL:
        return 'eco';
      case EventCategory.EDUCATION:
        return 'school';
      case EventCategory.HEALTHCARE:
        return 'local-hospital';
      case EventCategory.SENIOR_CARE:
        return 'elderly';
      default:
        return 'event';
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: event.coordinates.latitude,
        longitude: event.coordinates.longitude,
      }}
      onPress={onPress}
    >
      <View style={[styles.markerContainer, { backgroundColor: getMarkerColor() }]}>
        <Icon name={getMarkerIcon()} size={20} color={Colors.white} />
      </View>
      <Callout style={styles.callout}>
        <View style={styles.calloutContent}>
          <Text style={styles.calloutTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={styles.calloutLocation} numberOfLines={1}>
            {event.location}
          </Text>
          <Text style={styles.calloutDate}>
            {new Date(event.date).toLocaleDateString()}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const MapScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading } = useSelector((state: RootState) => state.events);

  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  useEffect(() => {
    dispatch(fetchEvents());
    getCurrentLocation();
  }, [dispatch]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation({ latitude, longitude });
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        setLocationLoading(false);
      },
      (error) => {
        console.log('Location error:', error);
        setLocationLoading(false);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please enable location services.',
          [{ text: 'OK' }]
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleEventMarkerPress = (event: VolunteerEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventCardPress = () => {
    setShowEventModal(false);
    if (selectedEvent) {
      navigation.navigate('EventDetails' as never, { eventId: selectedEvent.id } as never);
    }
  };

  const zoomToEvent = (event: VolunteerEvent) => {
    const eventRegion = {
      latitude: event.coordinates.latitude,
      longitude: event.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current?.animateToRegion(eventRegion, 1000);
  };

  const toggleMapType = () => {
    const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        style={styles.controlButton}
        onPress={getCurrentLocation}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Icon name="my-location" size={20} color={Colors.primary} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.controlButton}
        onPress={toggleMapType}
      >
        <Icon name="layers" size={20} color={Colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => navigation.navigate('CreateEvent' as never)}
      >
        <Icon name="add" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Event Categories</Text>
      <View style={styles.legendItems}>
        {Object.values(EventCategory).map((category) => {
          const getColor = () => {
            switch (category) {
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

          return (
            <View key={category} style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: getColor() }]} />
              <Text style={styles.legendText}>
                {category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Volunteer Map</Text>
        <Text style={styles.subtitle}>
          {events.length} events • {events.filter(e => e.spotsAvailable > 0).length} available
        </Text>
      </View>
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('Events' as never)}
      >
        <Icon name="list" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onRegionChangeComplete={setRegion}
        >
          {events.map((event) => (
            <EventMarker
              key={event.id}
              event={event}
              onPress={() => handleEventMarkerPress(event)}
            />
          ))}
        </MapView>
        
        {renderControls()}
        {renderLegend()}
      </View>

      {/* Event Details Modal */}
      <Modal
        visible={showEventModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEventModal(false)}
              >
                <Icon name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <EventCard 
                event={selectedEvent}
                onPress={handleEventCardPress}
                style={styles.modalEventCard}
              />
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => selectedEvent && zoomToEvent(selectedEvent)}
              >
                <Icon name="zoom-in" size={16} color={Colors.primary} />
                <Text style={styles.modalActionText}>Zoom to Location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalActionButton, styles.primaryAction]}
                onPress={handleEventCardPress}
              >
                <Icon name="info" size={16} color={Colors.white} />
                <Text style={[styles.modalActionText, { color: Colors.white }]}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  callout: {
    width: 200,
  },
  calloutContent: {
    padding: Spacing.sm,
  },
  calloutTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  calloutLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  calloutDate: {
    ...Typography.caption,
    color: Colors.primary,
  },
  controlsContainer: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    gap: Spacing.sm,
  },
  controlButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    maxWidth: width * 0.4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  legendItems: {
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.black + '50',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing.xl,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalEventCard: {
    margin: Spacing.lg,
    marginBottom: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalActionText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default MapScreen;
