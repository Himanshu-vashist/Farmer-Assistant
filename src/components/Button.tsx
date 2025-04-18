import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  // Determine text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  // Determine button size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // Determine text size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.card : theme.colors.primary}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon as any}
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={variant === 'primary' ? theme.colors.card : theme.colors.primary}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getTextSizeStyle(),
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  mediumButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  largeButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  text: {
    fontWeight: '500', // Using string value instead of theme.typography.fontWeights.medium
  },
  primaryText: {
    color: theme.colors.card,
  },
  secondaryText: {
    color: theme.colors.card,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  smallText: {
    fontSize: theme.typography.fontSizes.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSizes.md,
  },
  largeText: {
    fontSize: theme.typography.fontSizes.lg,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default Button;
