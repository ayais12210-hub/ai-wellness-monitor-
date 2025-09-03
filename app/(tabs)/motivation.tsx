import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Bell, BellOff, Clock, Sparkles, MessageCircle, Send, Bot, User } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { useWellness } from '@/hooks/wellness-store';

const { width } = Dimensions.get('window');

interface QuoteDelivery {
  hour: number;
  quote: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CoreMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const motivationalQuotes = [
  "Every morning brings new opportunities. Make today count! 🌅",
  "Success is the sum of small efforts repeated day in and day out. Keep going! 💪",
  "Your potential is endless. Don't let anyone dim your light. ✨",
  "The best time to plant a tree was 20 years ago. The second best time is now. 🌱",
  "Believe in yourself and all that you are. You are capable of amazing things! 🚀",
  "Progress, not perfection. Every step forward is a victory. 👣",
  "Your dreams are valid. Keep working towards them with passion! 🎯",
  "Challenges are opportunities in disguise. Embrace them! 💎",
  "You are stronger than you think and braver than you feel. 🦁",
  "Focus on solutions, not problems. You've got this! 🔧",
  "Every expert was once a beginner. Keep learning and growing! 📚",
  "Your attitude determines your direction. Choose positivity! 🧭",
  "Small steps in the right direction can turn out to be the biggest steps of your life. 👟",
  "The only impossible journey is the one you never begin. Start today! 🛤️",
  "Your comeback is always stronger than your setback. Rise up! ⬆️",
  "Excellence is not a skill, it's an attitude. Cultivate it! 🏆",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. 💖",
  "You don't have to be perfect, you just have to be consistent. 📈",
  "Every sunset brings the promise of a new dawn. Tomorrow is full of possibilities! 🌇",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. 🌟",
  "The future belongs to those who believe in the beauty of their dreams. Dream big! 🌙",
  "You are never too old to set another goal or to dream a new dream. 💫",
  "Life is 10% what happens to you and 90% how you react to it. Choose wisely! ⚖️",
  "End your day with gratitude. You've made it through another day of growth! 🙏"
];

export default function MotivationScreen() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentHour, setCurrentHour] = useState<number>(0);
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [quotesDelivered, setQuotesDelivered] = useState<QuoteDelivery[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // AI Coach state
  const [showAICoach, setShowAICoach] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { currentMood, todayMetrics } = useWellness();

  console.log('MotivationScreen rendered:', { isActive, currentHour, currentQuote, notificationsEnabled });

  // Request notification permissions
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  };

  // Send notification
  const sendNotification = async (quote: string, hour: number): Promise<void> => {
    if (!notificationsEnabled) return;

    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Hour ${hour + 1} Motivation`, {
          body: quote,
          icon: '🌟',
        });
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Hour ${hour + 1} Motivation`,
          body: quote,
          sound: 'default',
        },
        trigger: null,
      });
    }
  };

  // Start the motivation agent
  const startAgent = async (): Promise<void> => {
    console.log('Starting motivation agent...');
    
    const permissionGranted = await requestNotificationPermission();
    console.log('Permission granted:', permissionGranted);
    
    if (!permissionGranted) {
      Alert.alert(
        'Notifications',
        'Notifications are recommended for the best experience, but you can continue without them.',
        [
          { text: 'Continue Anyway', onPress: () => proceedWithStart() },
          { text: 'Enable Notifications', onPress: async () => {
            const granted = await requestNotificationPermission();
            if (granted) {
              setNotificationsEnabled(true);
              await proceedWithStart();
            }
          }}
        ]
      );
      return;
    }

    await proceedWithStart();
  };

  const proceedWithStart = async (): Promise<void> => {
    console.log('Proceeding with start...');
    setIsActive(true);
    setCurrentHour(0);
    setQuotesDelivered([]);
    
    // Send first quote immediately
    const firstQuote = motivationalQuotes[0];
    console.log('Setting first quote:', firstQuote);
    setCurrentQuote(firstQuote);
    await sendNotification(firstQuote, 0);
    setQuotesDelivered([{ hour: 1, quote: firstQuote, timestamp: new Date() }]);

    // Set up interval (5 seconds for demo, would be 3600000 for 1 hour in production)
    intervalRef.current = setInterval(() => {
      console.log('Interval tick');
      setCurrentHour(prev => {
        const nextHour = prev + 1;
        console.log('Next hour:', nextHour);
        
        if (nextHour >= 24) {
          // Complete cycle
          setIsActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          Alert.alert(
            'Journey Complete! 🎉',
            'You\'ve completed your 24-hour motivation journey. Well done!',
            [{ text: 'Amazing!' }]
          );
          return prev;
        }

        const quote = motivationalQuotes[nextHour];
        console.log('Setting quote for hour', nextHour, ':', quote);
        setCurrentQuote(quote);
        sendNotification(quote, nextHour);
        
        setQuotesDelivered(prev => [...prev, {
          hour: nextHour + 1,
          quote: quote,
          timestamp: new Date()
        }]);

        return nextHour;
      });
    }, 5000); // Demo: 5 seconds (change to 3600000 for 1 hour)
  };

  // Stop the agent
  const stopAgent = (): void => {
    console.log('Stopping motivation agent...');
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Reset the agent
  const resetAgent = (): void => {
    console.log('Resetting motivation agent...');
    stopAgent();
    setCurrentHour(0);
    setCurrentQuote('');
    setQuotesDelivered([]);
  };

  // Toggle notifications
  const toggleNotifications = async (): Promise<void> => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Calculate progress
  const progress = ((currentHour + (isActive ? 1 : 0)) / 24) * 100;

  // AI Coach functions
  const sendMessageToAI = async (message: string): Promise<void> => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare context about user's wellness data
      const wellnessContext = `Current wellness data: Mood: ${currentMood || 'not set'}, Water: ${todayMetrics?.water || 0} glasses, Sleep: ${todayMetrics?.sleep || 0} hours, Exercise: ${todayMetrics?.exercise || 0} minutes, Meals: ${todayMetrics?.meals || 0}, Stress: ${todayMetrics?.stress || 3}/5, Energy: ${todayMetrics?.energy || 3}/5`;
      
      const messages: CoreMessage[] = [
        {
          role: 'system',
          content: `You are an AI wellness and motivation coach. You provide personalized, empathetic, and actionable advice to help users improve their mental and physical wellbeing. Keep responses concise but meaningful (2-3 sentences max). Use encouraging language and provide specific, actionable suggestions. ${wellnessContext}`
        },
        ...chatMessages.slice(-5).map(msg => ({ // Include last 5 messages for context
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message.trim()
        }
      ];

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.completion,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Coach error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment. In the meantime, remember that you\'re doing great by taking care of your mental health!',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewCoachingSession = (): void => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hi! I'm your AI wellness coach. I can see you're ${currentMood ? `feeling ${currentMood}` : 'working on your wellness journey'} today. How can I help you stay motivated and reach your goals?`,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
    setShowAICoach(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Sparkles color="#fbbf24" size={28} />
            <Text style={styles.title}>24-Hour Motivation Agent</Text>
            <Sparkles color="#fbbf24" size={28} />
          </View>
          <Text style={styles.subtitle}>Your personal AI companion for daily inspiration</Text>
          {currentMood && (
            <Text style={styles.moodText}>Feeling {currentMood} today</Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Clock color="#667eea" size={24} />
              <Text style={styles.progressText}>
                {isActive ? currentHour + 1 : currentHour}/24
              </Text>
              <Text style={styles.progressLabel}>Hours</Text>
            </View>
            {/* Progress indicator */}
            <View style={styles.progressIndicator}>
              <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {!isActive ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={startAgent}
              testID="start-journey-button"
            >
              <Play color="#fff" size={20} />
              <Text style={styles.buttonText}>Start 24h Journey</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.pauseButton]}
              onPress={stopAgent}
              testID="pause-journey-button"
            >
              <Pause color="#fff" size={20} />
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetAgent}
            testID="reset-journey-button"
          >
            <RotateCcw color="#fff" size={20} />
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              notificationsEnabled ? styles.notificationEnabledButton : styles.notificationDisabledButton
            ]}
            onPress={toggleNotifications}
            testID="toggle-notifications-button"
          >
            {notificationsEnabled ? <Bell color="#fff" size={20} /> : <BellOff color="#fff" size={20} />}
            <Text style={styles.buttonText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Current Quote */}
        {currentQuote ? (
          <View style={styles.currentQuoteContainer}>
            <Text style={styles.currentQuoteTitle}>
              Current Motivation (Hour {currentHour + 1})
            </Text>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{currentQuote}"</Text>
            </View>
          </View>
        ) : null}

        {/* Quote History */}
        {quotesDelivered.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>
              Motivation History ({quotesDelivered.length}/24)
            </Text>
            <View style={styles.historyList}>
              {quotesDelivered.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <View style={styles.hourBadge}>
                      <Text style={styles.hourBadgeText}>Hour {item.hour}</Text>
                    </View>
                    <Text style={styles.timestamp}>
                      {item.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.historyQuote}>{item.quote}</Text>
                </View>
              ))}
            </View>
          </View>
        )}



        {/* AI Coach Section */}
        <View style={styles.aiCoachContainer}>
          <View style={styles.aiCoachHeader}>
            <Bot color="#667eea" size={24} />
            <Text style={styles.aiCoachTitle}>AI Wellness Coach</Text>
          </View>
          
          {!showAICoach ? (
            <View style={styles.aiCoachIntro}>
              <Text style={styles.aiCoachDescription}>
                Get personalized motivation and wellness advice powered by AI. Your coach understands your current wellness data and can provide tailored guidance.
              </Text>
              <TouchableOpacity
                style={styles.startCoachButton}
                onPress={startNewCoachingSession}
                testID="start-ai-coach-button"
              >
                <MessageCircle color="#fff" size={20} />
                <Text style={styles.startCoachButtonText}>Start Coaching Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chatContainer}>
              <ScrollView 
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
              >
                {chatMessages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageContainer,
                      message.role === 'user' ? styles.userMessage : styles.assistantMessage
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      {message.role === 'user' ? (
                        <User color="#667eea" size={16} />
                      ) : (
                        <Bot color="#10b981" size={16} />
                      )}
                      <Text style={styles.messageRole}>
                        {message.role === 'user' ? 'You' : 'AI Coach'}
                      </Text>
                      <Text style={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.messageContent}>{message.content}</Text>
                  </View>
                ))}
                {isLoading && (
                  <View style={[styles.messageContainer, styles.assistantMessage]}>
                    <View style={styles.messageHeader}>
                      <Bot color="#10b981" size={16} />
                      <Text style={styles.messageRole}>AI Coach</Text>
                    </View>
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#10b981" />
                      <Text style={styles.loadingText}>Thinking...</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Ask your AI coach anything..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={500}
                  testID="ai-coach-input"
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled
                  ]}
                  onPress={() => sendMessageToAI(inputMessage)}
                  disabled={!inputMessage.trim() || isLoading}
                  testID="send-message-button"
                >
                  <Send color={(!inputMessage.trim() || isLoading) ? '#9ca3af' : '#fff'} size={20} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.newSessionButton}
                onPress={startNewCoachingSession}
                testID="new-session-button"
              >
                <Text style={styles.newSessionButtonText}>Start New Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>• Click "Start 24h Journey" to begin receiving hourly motivational quotes</Text>
            <Text style={styles.instructionItem}>• Enable notifications to receive quotes even when the app is closed</Text>
            <Text style={styles.instructionItem}>• Chat with your AI coach for personalized wellness advice</Text>
            <Text style={styles.instructionItem}>• For demo purposes, quotes are sent every 5 seconds (would be hourly in production)</Text>
            <Text style={styles.instructionItem}>• Track your progress with the circular progress indicator</Text>
          </View>
        </View>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  moodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  progressInner: {
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  pauseButton: {
    backgroundColor: '#ef4444',
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  notificationEnabledButton: {
    backgroundColor: '#3b82f6',
  },
  notificationDisabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentQuoteContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentQuoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  quoteCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  quoteText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
    maxHeight: 400,
  },
  historyItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hourBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hourBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  historyQuote: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  // AI Coach styles
  aiCoachContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  aiCoachTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  aiCoachIntro: {
    alignItems: 'center',
    gap: 16,
  },
  aiCoachDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  startCoachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startCoachButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    gap: 16,
  },
  messagesContainer: {
    maxHeight: 300,
    gap: 12,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 'auto',
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  newSessionButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  newSessionButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});