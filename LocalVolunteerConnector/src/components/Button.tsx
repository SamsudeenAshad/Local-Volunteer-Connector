// Custom Button component
// Created by Samsudeen Ashad

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];
  const textStyles = [
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.surface : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  // Sizes
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  // Disabled state
  disabled: {
    opacity: 0.6,
  },  // Text styles
  buttonText: {
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.surface,
    fontSize: Typography.sizes.md,
  },
  secondaryText: {
    color: Colors.surface,
    fontSize: Typography.sizes.md,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
  },
  textText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
  },
  smallText: {
    fontSize: Typography.sizes.sm,
  },
  mediumText: {
    fontSize: Typography.sizes.md,
  },
  largeText: {
    fontSize: Typography.sizes.lg,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
