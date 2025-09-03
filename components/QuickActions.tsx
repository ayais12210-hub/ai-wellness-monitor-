import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Wind, Heart, Target, BookOpen } from 'lucide-react-native';

const ACTIONS = [
  {
    id: 'breathing',
    icon: Wind,
    title: 'Breathing',
    subtitle: '5 min exercise',
    color: '#3b82f6',
  },
  {
    id: 'gratitude',
    icon: Heart,
    title: 'Gratitude',
    subtitle: 'Daily practice',
    color: '#ef4444',
  },
  {
    id: 'goals',
    icon: Target,
    title: 'Goals',
    subtitle: 'Set intentions',
    color: '#10b981',
  },
  {
    id: 'journal',
    icon: BookOpen,
    title: 'Journal',
    subtitle: 'Reflect & write',
    color: '#f59e0b',
  },
];

export function QuickActions() {
  const handleActionPress = (actionId: string) => {
    console.log(`Quick action pressed: ${actionId}`);
    // TODO: Navigate to specific action screens
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleActionPress(action.id)}
              testID={`quick-action-${action.id}`}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <IconComponent color="#fff" size={24} />
              </View>
              
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});