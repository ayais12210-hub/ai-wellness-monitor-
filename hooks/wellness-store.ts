import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

export type MoodType = 'amazing' | 'good' | 'okay' | 'low' | 'struggling';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  date: string;
  note?: string;
}

export interface MotivationMessage {
  id: string;
  message: string;
  type: 'affirmation' | 'quote' | 'tip';
  date: string;
}

export interface WellnessMetrics {
  water: number;
  sleep: number;
  exercise: number;
  meals: number;
  mood: number;
  stress: number;
  energy: number;
  toiletBreaks: number;
  // Advanced metrics from smartwatch
  steps: number;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodGlucose: number;
  bloodOxygen: number;
  bodyFatPercentage: number;
  muscleMass: number;
  boneDensity: number;
  metabolicAge: number;
}

export interface SleepEntry {
  id: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  date: string;
}

export interface ToiletEntry {
  id: string;
  time: string;
  date: string;
  type: 'bathroom' | 'hydration';
}

export interface SmartWatchData {
  deviceName: string;
  lastSync: string;
  batteryLevel: number;
  isConnected: boolean;
}

export interface HealthReading {
  id: string;
  type: 'heartRate' | 'bloodPressure' | 'bloodGlucose' | 'bloodOxygen' | 'steps';
  value: number | { systolic: number; diastolic: number };
  timestamp: string;
  source: 'manual' | 'smartwatch';
}

const STORAGE_KEYS = {
  MOOD_HISTORY: 'wellness_mood_history',
  CURRENT_MOOD: 'wellness_current_mood',
  MOTIVATION_MESSAGES: 'wellness_motivation_messages',
  CHECK_IN_COUNT: 'wellness_check_in_count',
  STREAK_DAYS: 'wellness_streak_days',
  DAILY_METRICS: 'wellness_daily_metrics',
  SLEEP_HISTORY: 'wellness_sleep_history',
  TOILET_HISTORY: 'wellness_toilet_history',
  SMARTWATCH_DATA: 'wellness_smartwatch_data',
  HEALTH_READINGS: 'wellness_health_readings',
};

export const [WellnessProvider, useWellness] = createContextHook(() => {
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [todayMotivation, setTodayMotivation] = useState<MotivationMessage | null>(null);
  const [checkInCount, setCheckInCount] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(7);
  const [isGeneratingMotivation, setIsGeneratingMotivation] = useState(false);
  const [todayMetrics, setTodayMetrics] = useState<WellnessMetrics>({
    water: 0,
    sleep: 0,
    exercise: 0,
    meals: 0,
    mood: 3,
    stress: 3,
    energy: 3,
    toiletBreaks: 0,
    steps: 0,
    heartRate: 70,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    bloodGlucose: 90,
    bloodOxygen: 98,
    bodyFatPercentage: 20,
    muscleMass: 30,
    boneDensity: 1.2,
    metabolicAge: 25,
  });
  const [sleepHistory, setSleepHistory] = useState<SleepEntry[]>([]);
  const [toiletHistory, setToiletHistory] = useState<ToiletEntry[]>([]);
  const [smartWatchData, setSmartWatchData] = useState<SmartWatchData | null>(null);
  const [healthReadings, setHealthReadings] = useState<HealthReading[]>([]);

  // Load stored data
  const dataQuery = useQuery({
    queryKey: ['wellness-data'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const [mood, history, messages, count, streak, metrics, sleepData, toiletData, watchData, readings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_MOOD),
        AsyncStorage.getItem(STORAGE_KEYS.MOOD_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.MOTIVATION_MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.CHECK_IN_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK_DAYS),
        AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_METRICS}_${today}`),
        AsyncStorage.getItem(STORAGE_KEYS.SLEEP_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.TOILET_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.SMARTWATCH_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.HEALTH_READINGS),
      ]);

      return {
        currentMood: mood ? JSON.parse(mood) : null,
        moodHistory: history ? JSON.parse(history) : [],
        motivationMessages: messages ? JSON.parse(messages) : [],
        checkInCount: count ? parseInt(count) : 0,
        streakDays: streak ? parseInt(streak) : 7,
        todayMetrics: metrics ? JSON.parse(metrics) : {
          water: 0,
          sleep: 0,
          exercise: 0,
          meals: 0,
          mood: 3,
          stress: 3,
          energy: 3,
          toiletBreaks: 0,
          steps: 0,
          heartRate: 70,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          bloodGlucose: 90,
          bloodOxygen: 98,
          bodyFatPercentage: 20,
          muscleMass: 30,
          boneDensity: 1.2,
          metabolicAge: 25,
        },
        sleepHistory: sleepData ? JSON.parse(sleepData) : [],
        toiletHistory: toiletData ? JSON.parse(toiletData) : [],
        smartWatchData: watchData ? JSON.parse(watchData) : null,
        healthReadings: readings ? JSON.parse(readings) : [],
      };
    },
  });

  // Save mood entry
  const saveMoodMutation = useMutation({
    mutationFn: async ({ mood, note }: { mood: MoodType; note?: string }) => {
      const entry: MoodEntry = {
        id: Date.now().toString(),
        mood,
        date: new Date().toISOString(),
        note,
      };

      const updatedHistory = [...moodHistory, entry];
      const newCount = checkInCount + 1;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MOOD, JSON.stringify(mood)),
        AsyncStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(updatedHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.CHECK_IN_COUNT, newCount.toString()),
      ]);

      return { mood, history: updatedHistory, count: newCount };
    },
    onSuccess: ({ mood, history, count }) => {
      setCurrentMood(mood);
      setMoodHistory(history);
      setCheckInCount(count);
    },
  });

  // Generate AI motivation
  const generateMotivationMutation = useMutation({
    mutationFn: async (mood?: MoodType) => {
      setIsGeneratingMotivation(true);
      
      const prompt = mood 
        ? `Generate a personalized, uplifting motivational message for someone feeling ${mood}. Make it warm, encouraging, and actionable. Keep it under 100 words.`
        : 'Generate an inspiring daily affirmation for mental wellness and personal growth. Make it positive and empowering. Keep it under 100 words.';

      try {
        const response = await fetch('https://toolkit.rork.com/text/llm/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a compassionate wellness coach who provides personalized motivational messages.' },
              { role: 'user', content: prompt }
            ]
          }),
        });

        const data = await response.json();
        
        const message: MotivationMessage = {
          id: Date.now().toString(),
          message: data.completion,
          type: 'affirmation',
          date: new Date().toISOString(),
        };

        return message;
      } catch (error) {
        console.error('Failed to generate motivation:', error);
        // Fallback message
        return {
          id: Date.now().toString(),
          message: "You are stronger than you think, braver than you feel, and more loved than you know. Today is a new opportunity to grow and shine.",
          type: 'affirmation' as const,
          date: new Date().toISOString(),
        };
      } finally {
        setIsGeneratingMotivation(false);
      }
    },
    onSuccess: (message) => {
      setTodayMotivation(message);
    },
  });

  // Generate AI insight
  const generateInsightMutation = useMutation({
    mutationFn: async () => {
      const recentMoods = moodHistory.slice(-7).map(entry => entry.mood).join(', ');
      
      const prompt = `Based on these recent mood entries: ${recentMoods}, provide a brief, encouraging wellness insight or tip. Focus on patterns and actionable advice. Keep it under 80 words.`;

      try {
        const response = await fetch('https://toolkit.rork.com/text/llm/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a mental wellness expert providing personalized insights based on mood patterns.' },
              { role: 'user', content: prompt }
            ]
          }),
        });

        const data = await response.json();
        return data.completion;
      } catch (error) {
        console.error('Failed to generate insight:', error);
        return "Remember that every small step counts in your wellness journey. Consistency in self-care, even for just a few minutes daily, can create meaningful positive changes over time.";
      }
    },
  });

  // Save metrics mutation
  const saveMetricsMutation = useMutation({
    mutationFn: async (metrics: WellnessMetrics) => {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`${STORAGE_KEYS.DAILY_METRICS}_${today}`, JSON.stringify(metrics));
      return metrics;
    },
    onSuccess: (metrics) => {
      setTodayMetrics(metrics);
    },
  });

  // Save sleep entry
  const saveSleepMutation = useMutation({
    mutationFn: async (sleepEntry: Omit<SleepEntry, 'id'>) => {
      const entry: SleepEntry = {
        ...sleepEntry,
        id: Date.now().toString(),
      };
      const updatedHistory = [...sleepHistory, entry];
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    },
    onSuccess: (history) => {
      setSleepHistory(history);
    },
  });

  // Save toilet entry
  const saveToiletMutation = useMutation({
    mutationFn: async (type: 'bathroom' | 'hydration') => {
      const entry: ToiletEntry = {
        id: Date.now().toString(),
        time: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        type,
      };
      const updatedHistory = [...toiletHistory, entry];
      await AsyncStorage.setItem(STORAGE_KEYS.TOILET_HISTORY, JSON.stringify(updatedHistory));
      
      // Update toilet breaks count in metrics
      const updatedMetrics = { ...todayMetrics, toiletBreaks: todayMetrics.toiletBreaks + 1 };
      saveMetricsMutation.mutate(updatedMetrics);
      
      return updatedHistory;
    },
    onSuccess: (history) => {
      setToiletHistory(history);
    },
  });

  // Initialize data when query succeeds
  useEffect(() => {
    if (dataQuery.data) {
      setCurrentMood(dataQuery.data.currentMood);
      setMoodHistory(dataQuery.data.moodHistory);
      setCheckInCount(dataQuery.data.checkInCount);
      setStreakDays(dataQuery.data.streakDays);
      setTodayMetrics(dataQuery.data.todayMetrics);
      setSleepHistory(dataQuery.data.sleepHistory);
      setToiletHistory(dataQuery.data.toiletHistory);
      setSmartWatchData(dataQuery.data.smartWatchData);
      setHealthReadings(dataQuery.data.healthReadings);
      
      // Generate daily motivation if none exists for today
      const today = new Date().toDateString();
      const hasMotivationToday = dataQuery.data.motivationMessages.some(
        (msg: MotivationMessage) => new Date(msg.date).toDateString() === today
      );
      
      if (!hasMotivationToday) {
        generateMotivationMutation.mutate(undefined);
      } else {
        const todayMessage = dataQuery.data.motivationMessages.find(
          (msg: MotivationMessage) => new Date(msg.date).toDateString() === today
        );
        setTodayMotivation(todayMessage || null);
      }
    }
  }, [dataQuery.data]);

  // Update metric helper
  const updateMetric = useCallback((metric: keyof WellnessMetrics, change: number) => {
    const newValue = Math.max(0, todayMetrics[metric] + change);
    const updatedMetrics = { ...todayMetrics, [metric]: newValue };
    saveMetricsMutation.mutate(updatedMetrics);
  }, [todayMetrics, saveMetricsMutation.mutate]);

  // Set level helper (for mood, stress, energy)
  const setLevel = useCallback((metric: keyof WellnessMetrics, value: number) => {
    const updatedMetrics = { ...todayMetrics, [metric]: value };
    saveMetricsMutation.mutate(updatedMetrics);
  }, [todayMetrics, saveMetricsMutation.mutate]);

  // Connect smartwatch simulation
  const connectSmartWatchMutation = useMutation({
    mutationFn: async (deviceName: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const watchData: SmartWatchData = {
        deviceName,
        lastSync: new Date().toISOString(),
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        isConnected: true,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SMARTWATCH_DATA, JSON.stringify(watchData));
      return watchData;
    },
    onSuccess: (data) => {
      setSmartWatchData(data);
      syncSmartWatchDataMutation.mutate();
    },
  });

  // Sync smartwatch data simulation
  const syncSmartWatchDataMutation = useMutation({
    mutationFn: async () => {
      if (!smartWatchData?.isConnected) return null;
      
      const simulatedData = {
        steps: Math.floor(Math.random() * 5000) + 3000,
        heartRate: Math.floor(Math.random() * 40) + 60,
        bloodPressureSystolic: Math.floor(Math.random() * 40) + 110,
        bloodPressureDiastolic: Math.floor(Math.random() * 20) + 70,
        bloodGlucose: Math.floor(Math.random() * 40) + 80,
        bloodOxygen: Math.floor(Math.random() * 5) + 95,
        bodyFatPercentage: Math.floor(Math.random() * 15) + 15,
        muscleMass: Math.floor(Math.random() * 20) + 25,
        boneDensity: Math.round((Math.random() * 0.5 + 1.0) * 10) / 10,
        metabolicAge: Math.floor(Math.random() * 20) + 20,
      };
      
      const updatedMetrics = { ...todayMetrics, ...simulatedData };
      await AsyncStorage.setItem(`${STORAGE_KEYS.DAILY_METRICS}_${new Date().toISOString().split('T')[0]}`, JSON.stringify(updatedMetrics));
      
      const updatedWatchData = { ...smartWatchData, lastSync: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEYS.SMARTWATCH_DATA, JSON.stringify(updatedWatchData));
      
      return { metrics: updatedMetrics, watchData: updatedWatchData };
    },
    onSuccess: (data) => {
      if (data) {
        setTodayMetrics(data.metrics);
        setSmartWatchData(data.watchData);
      }
    },
  });

  // Disconnect smartwatch
  const disconnectSmartWatchMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.SMARTWATCH_DATA);
      return null;
    },
    onSuccess: () => {
      setSmartWatchData(null);
    },
  });

  // Calculate wellness score
  const calculateWellnessScore = useCallback((metrics: WellnessMetrics): number => {
    const goals = { 
      water: 8, sleep: 8, exercise: 60, meals: 3, mood: 4, stress: 2, energy: 4, toiletBreaks: 6,
      steps: 10000, heartRate: 70, bloodOxygen: 98
    };
    
    const waterScore = Math.min(metrics.water / goals.water, 1) * 12;
    const sleepScore = Math.min(metrics.sleep / goals.sleep, 1) * 15;
    const exerciseScore = Math.min(metrics.exercise / goals.exercise, 1) * 12;
    const mealsScore = Math.min(metrics.meals / goals.meals, 1) * 8;
    const moodScore = (metrics.mood / 5) * 12;
    const stressScore = ((5 - metrics.stress) / 5) * 8;
    const energyScore = (metrics.energy / 5) * 8;
    const toiletScore = Math.min(metrics.toiletBreaks / goals.toiletBreaks, 1) * 3;
    const stepsScore = Math.min(metrics.steps / goals.steps, 1) * 10;
    const heartRateScore = metrics.heartRate >= 60 && metrics.heartRate <= 100 ? 7 : 3;
    const oxygenScore = Math.min(metrics.bloodOxygen / goals.bloodOxygen, 1) * 5;

    return Math.round(waterScore + sleepScore + exerciseScore + mealsScore + moodScore + stressScore + energyScore + toiletScore + stepsScore + heartRateScore + oxygenScore);
  }, []);

  return useMemo(() => ({
    // State
    currentMood,
    moodHistory,
    todayMotivation,
    checkInCount,
    streakDays,
    isGeneratingMotivation,
    todayMetrics,
    sleepHistory,
    toiletHistory,
    smartWatchData,
    healthReadings,
    
    // Loading states
    isLoading: dataQuery.isLoading,
    isSavingMood: saveMoodMutation.isPending,
    isConnectingWatch: connectSmartWatchMutation.isPending,
    isSyncingWatch: syncSmartWatchDataMutation.isPending,
    
    // Actions
    saveMood: (mood: MoodType, note?: string) => saveMoodMutation.mutate({ mood, note }),
    generateMotivation: (mood?: MoodType) => generateMotivationMutation.mutate(mood),
    generateInsight: () => generateInsightMutation.mutateAsync(),
    updateMetric,
    setLevel,
    saveSleep: (sleepEntry: Omit<SleepEntry, 'id'>) => saveSleepMutation.mutate(sleepEntry),
    saveToiletEntry: (type: 'bathroom' | 'hydration') => saveToiletMutation.mutate(type),
    connectSmartWatch: (deviceName: string) => connectSmartWatchMutation.mutate(deviceName),
    syncSmartWatchData: () => syncSmartWatchDataMutation.mutate(),
    disconnectSmartWatch: () => disconnectSmartWatchMutation.mutate(),
    calculateWellnessScore,
    
    // Computed values
    wellnessScore: calculateWellnessScore(todayMetrics),
  }), [
    currentMood,
    moodHistory,
    todayMotivation,
    checkInCount,
    streakDays,
    isGeneratingMotivation,
    todayMetrics,
    sleepHistory,
    toiletHistory,
    smartWatchData,
    healthReadings,
    dataQuery.isLoading,
    saveMoodMutation.isPending,
    connectSmartWatchMutation.isPending,
    syncSmartWatchDataMutation.isPending,
    updateMetric,
    setLevel,
    calculateWellnessScore,
  ]);
});