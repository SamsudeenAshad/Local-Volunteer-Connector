import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';
import { Button } from '../../components/Button';
import { RootState, AppDispatch } from '../../store';
import { logout, updateProfile } from '../../store/slices/authSlice';

interface ProfileMenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightComponent,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {rightComponent}
      {showChevron && !rightComponent && (
        <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
      )}
    </View>
  </TouchableOpacity>
);

interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, color }) => (
  <View style={styles.statsCard}>
    <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{label}</Text>
  </View>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const stats = [
    {
      icon: 'event',
      value: user?.volunteerStats?.eventsJoined || 0,
      label: 'Events Joined',
      color: Colors.primary,
    },
    {
      icon: 'access-time',
      value: `${user?.volunteerStats?.hoursVolunteered || 0}h`,
      label: 'Hours Volunteered',
      color: Colors.secondary,
    },
    {
      icon: 'star',
      value: user?.volunteerStats?.rating || '5.0',
      label: 'Rating',
      color: Colors.accent,
    },
    {
      icon: 'people',
      value: user?.volunteerStats?.peopleHelped || 0,
      label: 'People Helped',
      color: Colors.success,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileImageContainer}>
        <Image
          source={
            user?.profilePicture 
              ? { uri: user.profilePicture }
              : require('../../assets/images/default-avatar.png')
          }
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editImageButton}>
          <Icon name="camera-alt" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      
      {user?.bio && (
        <Text style={styles.userBio}>{user.bio}</Text>
      )}

      <View style={styles.badgeContainer}>
        {user?.isVerified && (
          <View style={styles.badge}>
            <Icon name="verified" size={14} color={Colors.primary} />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        )}
        <View style={styles.badge}>
          <Icon name="star" size={14} color={Colors.accent} />
          <Text style={styles.badgeText}>Top Volunteer</Text>
        </View>
      </View>

      <Button
        title="Edit Profile"
        onPress={handleEditProfile}
        variant="outline"
        style={styles.editButton}
      />
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Your Impact</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </View>
    </View>
  );

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.sectionTitle}>Account</Text>
      
      <ProfileMenuItem
        icon="person"
        title="Personal Information"
        subtitle="Manage your personal details"
        onPress={handleEditProfile}
      />
      
      <ProfileMenuItem
        icon="notifications"
        title="Notifications"
        subtitle="Push notifications and alerts"
        onPress={() => {}}
        showChevron={false}
        rightComponent={
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
            thumbColor={notificationsEnabled ? Colors.primary : Colors.textSecondary}
          />
        }
      />
      
      <ProfileMenuItem
        icon="location-on"
        title="Location Services"
        subtitle="Enable location for nearby events"
        onPress={() => {}}
        showChevron={false}
        rightComponent={
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
            thumbColor={locationEnabled ? Colors.primary : Colors.textSecondary}
          />
        }
      />
      
      <ProfileMenuItem
        icon="history"
        title="My Events"
        subtitle="View your volunteer history"
        onPress={() => navigation.navigate('MyEvents' as never)}
      />
      
      <ProfileMenuItem
        icon="favorite"
        title="Saved Events"
        subtitle="Events you've bookmarked"
        onPress={() => navigation.navigate('SavedEvents' as never)}
      />

      <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Support</Text>
      
      <ProfileMenuItem
        icon="help"
        title="Help & Support"
        subtitle="FAQ and contact support"
        onPress={() => navigation.navigate('Help' as never)}
      />
      
      <ProfileMenuItem
        icon="feedback"
        title="Send Feedback"
        subtitle="Help us improve the app"
        onPress={() => navigation.navigate('Feedback' as never)}
      />
      
      <ProfileMenuItem
        icon="privacy-tip"
        title="Privacy Policy"
        onPress={() => navigation.navigate('Privacy' as never)}
      />
      
      <ProfileMenuItem
        icon="description"
        title="Terms of Service"
        onPress={() => navigation.navigate('Terms' as never)}
      />

      <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>About</Text>
      
      <ProfileMenuItem
        icon="info"
        title="App Version"
        subtitle="1.0.0"
        onPress={() => {}}
        showChevron={false}
      />

      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>Created by Samsudeen Ashad</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderStats()}
        {renderMenu()}
        
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  userBio: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  editButton: {
    width: 150,
  },
  statsContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statsValue: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statsLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  menuItemRight: {
    alignItems: 'center',
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
  logoutContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  logoutButton: {
    borderColor: Colors.error,
  },
  logoutButtonText: {
    color: Colors.error,
  },
});

export default ProfileScreen;
