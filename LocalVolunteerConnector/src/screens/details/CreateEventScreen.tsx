import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { Button } from '../../components/Button';
import { RootState, AppDispatch } from '../../store';
import { createEvent } from '../../store/slices/eventsSlice';
import { EventCategory, EventType, VolunteerEvent } from '../../types';

interface FormData {
  title: string;
  description: string;
  category: EventCategory | '';
  type: EventType | '';
  date: Date;
  location: string;
  maxVolunteers: string;
  requirements: string;
  contactInfo: string;
}

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    type: '',
    date: new Date(),
    location: '',
    maxVolunteers: '',
    requirements: '',
    contactInfo: user?.email || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const categories = [
    { value: EventCategory.DISASTER_RELIEF, label: 'Disaster Relief', icon: 'warning', color: Colors.error },
    { value: EventCategory.COMMUNITY_SERVICE, label: 'Community Service', icon: 'people', color: Colors.primary },
    { value: EventCategory.ENVIRONMENTAL, label: 'Environmental', icon: 'eco', color: Colors.success },
    { value: EventCategory.EDUCATION, label: 'Education', icon: 'school', color: Colors.secondary },
    { value: EventCategory.HEALTHCARE, label: 'Healthcare', icon: 'local-hospital', color: Colors.accent },
    { value: EventCategory.SENIOR_CARE, label: 'Senior Care', icon: 'elderly', color: Colors.warning },
  ];

  const types = [
    { value: EventType.ONE_TIME, label: 'One-time Event', description: 'Single occurrence' },
    { value: EventType.RECURRING, label: 'Recurring Event', description: 'Repeats regularly' },
    { value: EventType.ONGOING, label: 'Ongoing Event', description: 'Continuous opportunity' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.maxVolunteers.trim()) {
      newErrors.maxVolunteers = 'Number of volunteers is required';
    } else if (isNaN(Number(formData.maxVolunteers)) || Number(formData.maxVolunteers) < 1) {
      newErrors.maxVolunteers = 'Please enter a valid number';
    }

    if (formData.date <= new Date()) {
      newErrors.date = 'Event date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const eventData: Omit<VolunteerEvent, 'id' | 'currentVolunteers' | 'volunteers' | 'organizerImage' | 'organizerRating' | 'organizerEventsOrganized'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category as EventCategory,
      type: formData.type as EventType,
      date: formData.date.toISOString(),
      location: formData.location.trim(),
      maxVolunteers: Number(formData.maxVolunteers),
      spotsAvailable: Number(formData.maxVolunteers),
      requirements: formData.requirements.trim() || undefined,
      organizerId: user?.id || 'current-user',
      organizerName: user?.name || 'Event Organizer',
      contactInfo: formData.contactInfo.trim(),
      coordinates: {
        latitude: 37.7749, // Default coordinates - in real app, use geocoding
        longitude: -122.4194,
      },
      image: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      await dispatch(createEvent(eventData)).unwrap();
      
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(formData.date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    multiline?: boolean,
    keyboardType?: any,
    required?: boolean
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType || 'default'}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        Category <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryCard,
              formData.category === category.value && styles.categoryCardSelected,
              { borderColor: category.color },
            ]}
            onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <Icon name={category.icon} size={24} color={category.color} />
            </View>
            <Text style={[
              styles.categoryLabel,
              formData.category === category.value && styles.categoryLabelSelected,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        Event Type <Text style={styles.required}>*</Text>
      </Text>
      {types.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeOption,
            formData.type === type.value && styles.typeOptionSelected,
          ]}
          onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
        >
          <View style={styles.typeOptionContent}>
            <View style={styles.radioButton}>
              {formData.type === type.value && <View style={styles.radioButtonSelected} />}
            </View>
            <View style={styles.typeInfo}>
              <Text style={[
                styles.typeLabel,
                formData.type === type.value && styles.typeLabelSelected,
              ]}>
                {type.label}
              </Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
    </View>
  );

  const renderDateTimeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        Date & Time <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={[styles.dateTimeButton, { flex: 2 }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="event" size={20} color={Colors.primary} />
          <Text style={styles.dateTimeText}>
            {formData.date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.dateTimeButton, { flex: 1 }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Icon name="access-time" size={20} color={Colors.primary} />
          <Text style={styles.dateTimeText}>
            {formData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>
      {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.date}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderFormField(
          'Event Title',
          formData.title,
          (text) => setFormData(prev => ({ ...prev, title: text })),
          'Enter event title',
          errors.title,
          false,
          'default',
          true
        )}

        {renderFormField(
          'Description',
          formData.description,
          (text) => setFormData(prev => ({ ...prev, description: text })),
          'Describe the volunteer opportunity...',
          errors.description,
          true,
          'default',
          true
        )}

        {renderCategorySelector()}

        {renderTypeSelector()}

        {renderDateTimeSelector()}

        {renderFormField(
          'Location',
          formData.location,
          (text) => setFormData(prev => ({ ...prev, location: text })),
          'Enter event location',
          errors.location,
          false,
          'default',
          true
        )}

        {renderFormField(
          'Number of Volunteers Needed',
          formData.maxVolunteers,
          (text) => setFormData(prev => ({ ...prev, maxVolunteers: text })),
          'Enter number',
          errors.maxVolunteers,
          false,
          'numeric',
          true
        )}

        {renderFormField(
          'Requirements',
          formData.requirements,
          (text) => setFormData(prev => ({ ...prev, requirements: text })),
          'Any special requirements or skills needed...',
          undefined,
          true
        )}

        {renderFormField(
          'Contact Information',
          formData.contactInfo,
          (text) => setFormData(prev => ({ ...prev, contactInfo: text })),
          'How can volunteers contact you?',
          undefined,
          false,
          'email-address'
        )}

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>Created by Samsudeen Ashad</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Event"
          onPress={handleSubmit}
          loading={loading}
          style={styles.createButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.text,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  categoryCardSelected: {
    backgroundColor: Colors.primary + '10',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    ...Typography.caption,
    color: Colors.text,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  typeOption: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  typeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  typeLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  typeDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dateTimeText: {
    ...Typography.body,
    color: Colors.text,
  },
  watermark: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  watermarkText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    width: '100%',
  },
});

export default CreateEventScreen;
