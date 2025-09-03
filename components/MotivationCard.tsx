import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, RefreshCw } from 'lucide-react-native';
import { useWellness } from '@/hooks/wellness-store';

export function MotivationCard() {
  const { todayMotivation, generateMotivation, isGeneratingMotivation } = useWellness();

  const handleRefresh = () => {
    generateMotivation();
  };

  return (
    <LinearGradient
      colors={['#f093fb', '#f5576c']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Sparkles color="#fff" size={20} />
          <Text style={styles.title}>Daily Motivation</Text>
        </View>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isGeneratingMotivation}
          testID="refresh-motivation"
        >
          <RefreshCw 
            color="#fff" 
            size={20} 
            style={isGeneratingMotivation ? { opacity: 0.6 } : {}}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.message}>
        {isGeneratingMotivation 
          ? "Generating your personalized message..."
          : todayMotivation?.message || "You are capable of amazing things. Today is your day to shine and make a positive difference in your life and the lives of others."
        }
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isGeneratingMotivation ? "✨ AI is crafting..." : "✨ Powered by AI"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
    marginBottom: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});