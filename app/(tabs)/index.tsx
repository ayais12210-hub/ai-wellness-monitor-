import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Sparkles, Brain, TrendingUp } from 'lucide-react-native';
import { useWellness } from '@/hooks/wellness-store';
import { MoodSelector } from '@/components/MoodSelector';
import { MotivationCard } from '@/components/MotivationCard';
import { QuickActions } from '@/components/QuickActions';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { currentMood, todayMotivation, checkInCount } = useWellness();
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
          
          <TouchableOpacity
            style={styles.moodButton}
            onPress={() => setShowMoodSelector(true)}
            testID="mood-check-in-button"
          >
            <Heart color="#fff" size={20} />
            <Text style={styles.moodButtonText}>
              {currentMood ? `Feeling ${currentMood}` : 'Check in with your mood'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MotivationCard />
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp color="#667eea" size={24} />
            </View>
            <Text style={styles.statNumber}>{checkInCount}</Text>
            <Text style={styles.statLabel}>Check-ins this week</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Brain color="#f093fb" size={24} />
            </View>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        <QuickActions />
      </View>

      <MoodSelector
        visible={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  moodButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});