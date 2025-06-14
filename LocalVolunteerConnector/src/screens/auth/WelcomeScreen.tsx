// Welcome Screen - First screen users see
// Created by Samsudeen Ashad

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import Button from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={Colors.gradient.primary}
        style={styles.gradient}>
        
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://via.placeholder.com/120x120?text=🤝' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Local Volunteer Connector</Text>
            <Text style={styles.subtitle}>
              Connect with your community and make a difference
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🌍</Text>
              <Text style={styles.featureText}>Find local volunteer opportunities</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Chat with fellow volunteers</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🚨</Text>
              <Text style={styles.featureText}>Respond to emergency situations</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Track your volunteer journey</Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('Register')}
              size="large"
              style={styles.primaryButton}
            />
            <Button
              title="Already have an account? Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="text"
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Created by Samsudeen Ashad
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.surface,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 240,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  featureIcon: {
    fontSize: Typography.sizes.xl,
    marginRight: Spacing.md,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    fontSize: Typography.sizes.md,
    color: Colors.surface,
    flex: 1,
    opacity: 0.9,
  },
  buttonSection: {
    paddingBottom: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: Colors.surface,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.surface,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default WelcomeScreen;
