// Theme configuration for the Farmer Assistant app
// This file contains colors, typography, and other design constants

export const colors = {
    // Primary colors
    primary: '#2E7D32', // Dark green
    primaryLight: '#4CAF50', // Medium green
    primaryLighter: '#81C784', // Light green
    primaryDark: '#1B5E20', // Very dark green

    // Secondary colors
    secondary: '#FF9800', // Orange
    secondaryLight: '#FFB74D', // Light orange
    secondaryDark: '#F57C00', // Dark orange

    // Tertiary colors
    tertiary: '#9C27B0', // Purple
    tertiaryLight: '#BA68C8', // Light purple
    tertiaryDark: '#7B1FA2', // Dark purple

    // Accent colors
    accent: '#03A9F4', // Blue
    accentLight: '#4FC3F7', // Light blue
    accentDark: '#0288D1', // Dark blue

    // Neutral colors
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',

    // Status colors
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444',
    info: '#3B82F6',
    infoLight: '#60A5FA',

    // Gradients
    gradients: {
        primary: ['#2E7D32', '#4CAF50'],
        secondary: ['#F57C00', '#FF9800'],
        accent: ['#0288D1', '#03A9F4'],
    }
};

export const typography = {
    fontSizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },
    fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
    fonts: {
        heading: Platform.OS === 'ios' ? 'System' : 'Roboto',
        body: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
};

// Common styles for cards
export const cardStyles = {
    container: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    title: {
        fontSize: typography.fontSizes.xl,
        fontWeight: typography.fontWeights.semibold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
};

// Common styles for buttons
export const buttonStyles = {
    primary: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.medium,
    },
    primaryText: {
        color: colors.card,
    },
    secondaryText: {
        color: colors.primary,
    },
    icon: {
        marginRight: spacing.sm,
    },
    disabled: {
        opacity: 0.6,
    },
};

// Common styles for inputs
export const inputStyles = {
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSizes.md,
        color: colors.text,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    error: {
        color: colors.error,
        fontSize: typography.fontSizes.sm,
        marginTop: spacing.xs,
    },
};

import { Platform } from 'react-native';

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    cardStyles,
    buttonStyles,
    inputStyles,
};