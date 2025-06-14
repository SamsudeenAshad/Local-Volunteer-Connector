import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { Button } from '../../components/Button';
import { RootState, AppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  skills: string;
  interests: string;
  availability: string;
  emergencyContact: string;
  profilePicture?: string;
}

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    availability: user?.availability || '',
    emergencyContact: user?.emergencyContact || '',
    profilePicture: user?.profilePicture,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
        >
          <Icon name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={[styles.headerButton, { opacity: hasChanges ? 1 : 0.5 }]}
          onPress={handleSave}
          disabled={!hasChanges}
        >
          <Text style={[styles.saveButtonText, { color: hasChanges ? Colors.primary : Colors.textSecondary }]}>
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, hasChanges]);

  useEffect(() => {
    // Check if form data has changed
    const initialData = {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      skills: user?.skills?.join(', ') || '',
      interests: user?.interests?.join(', ') || '',
      availability: user?.availability || '',
      emergencyContact: user?.emergencyContact || '',
      profilePicture: user?.profilePicture,
    };

    const changed = Object.keys(formData).some(
      key => formData[key as keyof ProfileFormData] !== initialData[key as keyof ProfileFormData]
    );
    setHasChanges(changed);
  }, [formData, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors and try again.');
      return;
    }

    const updatedUserData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      interests: formData.interests.split(',').map(interest => interest.trim()).filter(Boolean),
    };

    try {
      setLoading(true);
      await dispatch(updateProfile(updatedUserData)).unwrap();
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() },
        { text: 'Remove Photo', style: 'destructive', onPress: () => removePhoto() },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setFormData(prev => ({ ...prev, profilePicture: response.assets![0].uri }));
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setFormData(prev => ({ ...prev, profilePicture: response.assets![0].uri }));
      }
    });
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePicture: undefined }));
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    multiline?: boolean,
    keyboardType?: any,
    required?: boolean,
    icon?: string,
    helperText?: string
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && (
          <Icon name={icon} size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        )}
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            icon && styles.textInputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
      </View>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={handleImagePicker}
          >
            <Image
              source={
                formData.profilePicture
                  ? { uri: formData.profilePicture }
                  : { uri: 'https://via.placeholder.com/120x120/E0E0E0/757575?text=User' }
              }
              style={styles.profilePicture}
            />
            <View style={styles.editImageOverlay}>
              <Icon name="camera-alt" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profilePictureHint}>Tap to change photo</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {renderFormField(
            'Full Name',
            formData.name,
            (text) => setFormData(prev => ({ ...prev, name: text })),
            'Enter your full name',
            errors.name,
            false,
            'default',
            true,
            'person'
          )}

          {renderFormField(
            'Email',
            formData.email,
            (text) => setFormData(prev => ({ ...prev, email: text })),
            'Enter your email address',
            errors.email,
            false,
            'email-address',
            true,
            'email'
          )}

          {renderFormField(
            'Phone Number',
            formData.phone,
            (text) => setFormData(prev => ({ ...prev, phone: text })),
            'Enter your phone number',
            errors.phone,
            false,
            'phone-pad',
            false,
            'phone'
          )}

          {renderFormField(
            'Location',
            formData.location,
            (text) => setFormData(prev => ({ ...prev, location: text })),
            'Enter your city, state',
            undefined,
            false,
            'default',
            false,
            'location-on'
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {renderFormField(
            'Bio',
            formData.bio,
            (text) => setFormData(prev => ({ ...prev, bio: text })),
            'Tell others about yourself and your passion for volunteering...',
            undefined,
            true,
            'default',
            false,
            undefined,
            'Share your motivation and experience with volunteering'
          )}
        </View>

        {/* Volunteer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteer Information</Text>
          
          {renderFormField(
            'Skills & Expertise',
            formData.skills,
            (text) => setFormData(prev => ({ ...prev, skills: text })),
            'e.g., First Aid, Teaching, Construction, Cooking',
            undefined,
            false,
            'default',
            false,
            'build',
            'Separate multiple skills with commas'
          )}

          {renderFormField(
            'Interests',
            formData.interests,
            (text) => setFormData(prev => ({ ...prev, interests: text })),
            'e.g., Environment, Education, Community Service',
            undefined,
            false,
            'default',
            false,
            'favorite',
            'What causes are you passionate about?'
          )}

          {renderFormField(
            'Availability',
            formData.availability,
            (text) => setFormData(prev => ({ ...prev, availability: text })),
            'e.g., Weekends, Evenings, Full-time',
            undefined,
            false,
            'default',
            false,
            'schedule'
          )}
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          {renderFormField(
            'Emergency Contact',
            formData.emergencyContact,
            (text) => setFormData(prev => ({ ...prev, emergencyContact: text })),
            'Name and phone number of emergency contact',
            undefined,
            false,
            'default',
            false,
            'contact-emergency',
            'For safety purposes during volunteer activities'
          )}
        </View>

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>Created by Samsudeen Ashad</Text>
        </View>
      </ScrollView>
    </View>
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
  saveButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  profilePictureSection: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profilePictureHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    padding: Spacing.md,
    paddingRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.text,
  },
  textInputWithIcon: {
    paddingLeft: 0,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  watermark: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: Spacing.sm,
  },
  watermarkText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default EditProfileScreen;
