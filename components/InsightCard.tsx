import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'pattern' | 'tip' | 'summary';
}

export function InsightCard({ icon, title, description, type }: InsightCardProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'pattern': return '#667eea';
      case 'tip': return '#f093fb';
      case 'summary': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor()}15` }]}>
          {icon}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={[styles.indicator, { backgroundColor: getTypeColor() }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
});