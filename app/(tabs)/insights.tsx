import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, TrendingUp, Lightbulb, Calendar, Sparkles } from 'lucide-react-native';
import { useWellness } from '@/hooks/wellness-store';
import { InsightCard } from '@/components/InsightCard';
import { MoodChart } from '@/components/MoodChart';

export default function InsightsScreen() {
  const { moodHistory, generateInsight } = useWellness();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedInsight, setGeneratedInsight] = useState<string>('');

  const handleGenerateInsight = async () => {
    try {
      setIsGenerating(true);
      const insight = await generateInsight();
      setGeneratedInsight(insight);
    } catch (error) {
      console.error('Failed to generate insight:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Brain color="#fff" size={32} />
          <Text style={styles.title}>Your Wellness Insights</Text>
          <Text style={styles.subtitle}>
            AI-powered analysis of your mental wellness journey
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MoodChart data={moodHistory} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <InsightCard
            icon={<TrendingUp color="#667eea" size={24} />}
            title="Mood Patterns"
            description="You tend to feel more positive in the mornings. Consider scheduling important tasks earlier in the day."
            type="pattern"
          />
          
          <InsightCard
            icon={<Lightbulb color="#f093fb" size={24} />}
            title="Wellness Tip"
            description="Based on your recent mood, try a 5-minute breathing exercise to boost your energy."
            type="tip"
          />
          
          <InsightCard
            icon={<Calendar color="#10b981" size={24} />}
            title="Weekly Summary"
            description="You've maintained a positive mindset for 5 out of 7 days this week. Great progress!"
            type="summary"
          />
          
          {generatedInsight ? (
            <InsightCard
              icon={<Sparkles color="#667eea" size={24} />}
              title="AI Generated Insight"
              description={generatedInsight}
              type="pattern"
            />
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateInsight}
          disabled={isGenerating}
          testID="generate-insight-button"
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.generateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Sparkles color="#fff" size={20} />
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate New Insight'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});