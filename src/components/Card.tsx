import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import theme from '../theme/theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.cardStyles.container,
  },
  title: {
    ...theme.cardStyles.title,
  },
  subtitle: {
    ...theme.cardStyles.subtitle,
  },
});

export default Card;
