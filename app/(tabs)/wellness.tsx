import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  Droplets,
  Moon,
  Utensils,
  Dumbbell,
  Brain,
  TrendingUp,
  Calendar,
  Award,
  Plus,
  Minus,
  BarChart3,
  Smile,
  Frown,
  Meh,
  Clock,
  Zap,
  Toilet,
  BedDouble,
  X,
  Watch,
  Activity,
  Footprints,
  Gauge,
  Scale,
  Wifi,
  WifiOff,
  RefreshCw,
  Battery,
  Bluetooth,
  Target,
} from 'lucide-react-native';
import { useWellness } from '@/hooks/wellness-store';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit: string;
  goal: number;
  color: string;
  onIncrease: () => void;
  onDecrease: () => void;
  showButtons?: boolean;
}

interface RatingCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
  labels: string[];
}

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (bedTime: string, wakeTime: string, quality: number) => void;
}

const goals = {
  water: 8,
  sleep: 8,
  exercise: 60,
  meals: 3,
  mood: 4,
  stress: 2,
  energy: 4,
  toiletBreaks: 6,
  steps: 10000,
  heartRate: 70,
  bloodOxygen: 98,
};

const SleepModal: React.FC<SleepModalProps> = ({ visible, onClose, onSave }) => {
  const [bedTime, setBedTime] = useState<string>('22:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [quality, setQuality] = useState<number>(3);

  const handleSave = () => {
    onSave(bedTime, wakeTime, quality);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Sleep</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bed Time</Text>
            <TextInput
              style={styles.timeInput}
              value={bedTime}
              onChangeText={setBedTime}
              placeholder="22:00"
              testID="bed-time-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Wake Time</Text>
            <TextInput
              style={styles.timeInput}
              value={wakeTime}
              onChangeText={setWakeTime}
              placeholder="07:00"
              testID="wake-time-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Sleep Quality</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(level => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setQuality(level)}
                  style={[
                    styles.ratingButton,
                    quality >= level ? styles.ratingButtonActive : styles.ratingButtonInactive
                  ]}
                  testID={`quality-${level}`}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    quality >= level ? styles.ratingButtonTextActive : styles.ratingButtonTextInactive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} testID="save-sleep-button">
            <Text style={styles.saveButtonText}>Save Sleep Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  unit,
  goal,
  color,
  onIncrease,
  onDecrease,
  showButtons = true,
}) => {
  const progress = Math.min((value / goal) * 100, 100);
  const isGoalMet = value >= goal;

  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricTitleContainer}>
          {icon}
          <Text style={styles.metricTitle}>{title}</Text>
        </View>
        {showButtons && (
          <View style={styles.metricButtons}>
            <TouchableOpacity
              onPress={onDecrease}
              style={styles.metricButton}
              testID={`decrease-${title.toLowerCase().replace(' ', '-')}`}
            >
              <Minus color="#64748b" size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onIncrease}
              style={[styles.metricButton, styles.metricButtonPrimary]}
              testID={`increase-${title.toLowerCase().replace(' ', '-')}`}
            >
              <Plus color="#fff" size={16} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>/ {goal} {unit}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>

      <Text style={[styles.progressText, isGoalMet ? styles.progressTextSuccess : null]}>
        {Math.round(progress)}% of goal
      </Text>
    </View>
  );
};

const RatingCard: React.FC<RatingCardProps> = ({ icon, title, value, color, onChange, labels }) => (
  <View style={[styles.ratingCard, { borderLeftColor: color }]}>
    <View style={styles.ratingHeader}>
      {icon}
      <Text style={styles.ratingTitle}>{title}</Text>
    </View>

    <View style={styles.ratingButtons}>
      {[1, 2, 3, 4, 5].map(level => (
        <TouchableOpacity
          key={level}
          onPress={() => onChange(level)}
          style={[
            styles.ratingButton,
            value >= level ? { backgroundColor: color } : styles.ratingButtonInactive
          ]}
          testID={`${title.toLowerCase().replace(' ', '-')}-${level}`}
        >
          <Text style={[
            styles.ratingButtonText,
            value >= level ? styles.ratingButtonTextActive : styles.ratingButtonTextInactive
          ]}>
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.ratingLabel}>{labels[value - 1]}</Text>
  </View>
);

export default function WellnessScreen() {
  const {
    todayMetrics,
    wellnessScore,
    updateMetric,
    setLevel,
    saveSleep,
    saveToiletEntry,
    sleepHistory,
    toiletHistory,
    smartWatchData,
    connectSmartWatch,
    syncSmartWatchData,
    disconnectSmartWatch,
    isConnectingWatch,
    isSyncingWatch,
  } = useWellness();

  const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<string>('Apple Watch');

  const handleSaveSleep = (bedTime: string, wakeTime: string, quality: number) => {
    const bedDateTime = new Date(`2024-01-01 ${bedTime}:00`);
    const wakeDateTime = new Date(`2024-01-01 ${wakeTime}:00`);
    
    if (wakeDateTime < bedDateTime) {
      wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }
    
    const duration = (wakeDateTime.getTime() - bedDateTime.getTime()) / (1000 * 60 * 60);
    
    saveSleep({
      bedTime,
      wakeTime,
      duration,
      quality,
      date: new Date().toISOString().split('T')[0],
    });
    
    updateMetric('sleep', Math.round(duration) - todayMetrics.sleep);
    Alert.alert('Sleep Logged', `You slept for ${duration.toFixed(1)} hours with quality ${quality}/5`);
  };

  const generateInsights = () => {
    const insights = [];
    
    if (todayMetrics.water < goals.water) {
      insights.push({
        type: 'warning' as const,
        icon: <Droplets color="#3b82f6" size={20} />,
        message: `You're ${goals.water - todayMetrics.water} glasses behind your hydration goal. Try setting hourly water reminders!`,
      });
    } else {
      insights.push({
        type: 'success' as const,
        icon: <Droplets color="#10b981" size={20} />,
        message: "Great hydration today! Your body is thanking you for staying well-hydrated.",
      });
    }

    if (todayMetrics.sleep < goals.sleep) {
      insights.push({
        type: 'warning' as const,
        icon: <Moon color="#8b5cf6" size={20} />,
        message: `You need ${goals.sleep - todayMetrics.sleep} more hours of sleep. Consider an earlier bedtime routine.`,
      });
    }

    if (todayMetrics.exercise < goals.exercise) {
      insights.push({
        type: 'suggestion' as const,
        icon: <Dumbbell color="#10b981" size={20} />,
        message: `${goals.exercise - todayMetrics.exercise} minutes left to hit your exercise goal. A quick walk could help!`,
      });
    }

    if (todayMetrics.mood <= 2) {
      insights.push({
        type: 'care' as const,
        icon: <Brain color="#ec4899" size={20} />,
        message: "Your mood seems low today. Consider talking to someone, practicing mindfulness, or doing something you enjoy.",
      });
    }

    if (todayMetrics.stress >= 4) {
      insights.push({
        type: 'urgent' as const,
        icon: <Heart color="#ef4444" size={20} />,
        message: "High stress levels detected. Try deep breathing exercises, meditation, or take a short break.",
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'celebration' as const,
        icon: <Award color="#f59e0b" size={20} />,
        message: "You're doing amazing today! All your wellness metrics are looking great. Keep up the excellent work!",
      });
    }

    return insights;
  };

  const insights = generateInsights();
  const todayToiletEntries = toiletHistory.filter(
    entry => entry.date === new Date().toISOString().split('T')[0]
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Heart color="#ef4444" size={28} />
            <Text style={styles.title}>AI Wellness Tracker</Text>
            <Brain color="#8b5cf6" size={28} />
          </View>
          <Text style={styles.subtitle}>Your intelligent companion for holistic health monitoring</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Wellness Score Dashboard */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Today's Wellness Score</Text>
              <Calendar color="#64748b" size={20} />
            </View>
            
            <View style={styles.scoreContent}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>{wellnessScore}</Text>
                <Text style={styles.scoreMax}>/ 100</Text>
              </View>
              
              <View style={styles.scoreStats}>
                <View style={styles.scoreStat}>
                  <Text style={styles.scoreStatValue}>85</Text>
                  <Text style={styles.scoreStatLabel}>Weekly Avg</Text>
                </View>
                <View style={styles.scoreStat}>
                  <Text style={[styles.scoreStatValue, { color: wellnessScore >= 85 ? '#10b981' : '#ef4444' }]}>
                    {wellnessScore >= 85 ? '+' : ''}{wellnessScore - 85}
                  </Text>
                  <Text style={styles.scoreStatLabel}>vs Average</Text>
                </View>
              </View>
            </View>
            
            <View style={[
              styles.scoreBadge,
              wellnessScore >= 80 ? styles.scoreBadgeExcellent :
              wellnessScore >= 60 ? styles.scoreBadgeGood :
              styles.scoreBadgeNeedsAttention
            ]}>
              <TrendingUp color="#fff" size={16} />
              <Text style={styles.scoreBadgeText}>
                {wellnessScore >= 80 ? 'Excellent Health' :
                 wellnessScore >= 60 ? 'Good Progress' :
                 'Needs Attention'}
              </Text>
            </View>
          </View>
        </View>

        {/* SmartWatch Connection */}
        <View style={styles.smartWatchContainer}>
          <View style={styles.smartWatchHeader}>
            <View style={styles.smartWatchTitleContainer}>
              <Watch color={smartWatchData?.isConnected ? '#10b981' : '#64748b'} size={24} />
              <Text style={styles.smartWatchTitle}>SmartWatch Integration</Text>
            </View>
            {smartWatchData?.isConnected ? (
              <View style={styles.connectedBadge}>
                <Wifi color="#10b981" size={16} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            ) : (
              <View style={styles.disconnectedBadge}>
                <WifiOff color="#ef4444" size={16} />
                <Text style={styles.disconnectedText}>Disconnected</Text>
              </View>
            )}
          </View>
          
          {smartWatchData?.isConnected ? (
            <View style={styles.smartWatchInfo}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{smartWatchData.deviceName}</Text>
                <View style={styles.batteryContainer}>
                  <Battery color="#10b981" size={16} />
                  <Text style={styles.batteryText}>{smartWatchData.batteryLevel}%</Text>
                </View>
              </View>
              <Text style={styles.lastSync}>
                Last sync: {new Date(smartWatchData.lastSync).toLocaleTimeString()}
              </Text>
              <View style={styles.smartWatchActions}>
                <TouchableOpacity
                  style={[styles.smartWatchButton, styles.syncButton]}
                  onPress={syncSmartWatchData}
                  disabled={isSyncingWatch}
                  testID="sync-watch-button"
                >
                  <RefreshCw color="#fff" size={16} />
                  <Text style={styles.smartWatchButtonText}>
                    {isSyncingWatch ? 'Syncing...' : 'Sync Data'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smartWatchButton, styles.disconnectButton]}
                  onPress={disconnectSmartWatch}
                  testID="disconnect-watch-button"
                >
                  <Text style={styles.smartWatchButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => setShowConnectModal(true)}
              disabled={isConnectingWatch}
              testID="connect-watch-button"
            >
              <Bluetooth color="#fff" size={20} />
              <Text style={styles.connectButtonText}>
                {isConnectingWatch ? 'Connecting...' : 'Connect SmartWatch'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Wellness Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon={<Droplets color="#3b82f6" size={24} />}
            title="Water Intake"
            value={todayMetrics.water}
            unit="glasses"
            goal={goals.water}
            color="#3b82f6"
            onIncrease={() => updateMetric('water', 1)}
            onDecrease={() => updateMetric('water', -1)}
          />
          
          <MetricCard
            icon={<Moon color="#8b5cf6" size={24} />}
            title="Sleep"
            value={todayMetrics.sleep}
            unit="hours"
            goal={goals.sleep}
            color="#8b5cf6"
            onIncrease={() => updateMetric('sleep', 1)}
            onDecrease={() => updateMetric('sleep', -1)}
          />
          
          <MetricCard
            icon={<Dumbbell color="#10b981" size={24} />}
            title="Exercise"
            value={todayMetrics.exercise}
            unit="minutes"
            goal={goals.exercise}
            color="#10b981"
            onIncrease={() => updateMetric('exercise', 15)}
            onDecrease={() => updateMetric('exercise', -15)}
          />
          
          <MetricCard
            icon={<Utensils color="#f59e0b" size={24} />}
            title="Meals"
            value={todayMetrics.meals}
            unit="meals"
            goal={goals.meals}
            color="#f59e0b"
            onIncrease={() => updateMetric('meals', 1)}
            onDecrease={() => updateMetric('meals', -1)}
          />
        </View>

        {/* Advanced Health Metrics */}
        <View style={styles.sectionHeader}>
          <Activity color="#8b5cf6" size={24} />
          <Text style={styles.sectionTitle}>Advanced Health Metrics</Text>
          {!smartWatchData?.isConnected && (
            <Text style={styles.sectionSubtitle}>Connect your smartwatch for real-time data</Text>
          )}
        </View>
        
        <View style={styles.advancedMetricsGrid}>
          <View style={styles.advancedMetricCard}>
            <View style={styles.advancedMetricHeader}>
              <Footprints color="#10b981" size={20} />
              <Text style={styles.advancedMetricTitle}>Steps</Text>
            </View>
            <Text style={styles.advancedMetricValue}>{todayMetrics.steps.toLocaleString()}</Text>
            <Text style={styles.advancedMetricGoal}>Goal: {goals.steps.toLocaleString()}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${Math.min((todayMetrics.steps / goals.steps) * 100, 100)}%`, 
                backgroundColor: '#10b981' 
              }]} />
            </View>
          </View>

          <View style={styles.advancedMetricCard}>
            <View style={styles.advancedMetricHeader}>
              <Heart color="#ef4444" size={20} />
              <Text style={styles.advancedMetricTitle}>Heart Rate</Text>
            </View>
            <Text style={styles.advancedMetricValue}>{todayMetrics.heartRate} BPM</Text>
            <Text style={styles.advancedMetricStatus}>
              {todayMetrics.heartRate >= 60 && todayMetrics.heartRate <= 100 ? 'Normal' : 'Monitor'}
            </Text>
          </View>

          <View style={styles.advancedMetricCard}>
            <View style={styles.advancedMetricHeader}>
              <Gauge color="#f59e0b" size={20} />
              <Text style={styles.advancedMetricTitle}>Blood Pressure</Text>
            </View>
            <Text style={styles.advancedMetricValue}>
              {todayMetrics.bloodPressureSystolic}/{todayMetrics.bloodPressureDiastolic}
            </Text>
            <Text style={styles.advancedMetricUnit}>mmHg</Text>
          </View>

          <View style={styles.advancedMetricCard}>
            <View style={styles.advancedMetricHeader}>
              <Target color="#8b5cf6" size={20} />
              <Text style={styles.advancedMetricTitle}>Blood Glucose</Text>
            </View>
            <Text style={styles.advancedMetricValue}>{todayMetrics.bloodGlucose}</Text>
            <Text style={styles.advancedMetricUnit}>mg/dL</Text>
          </View>

          <View style={styles.advancedMetricCard}>
            <View style={styles.advancedMetricHeader}>
              <Activity color="#06b6d4" size={20} />
              <Text style={styles.advancedMetricTitle}>Blood Oxygen</Text>
            </View>
            <Text style={styles.advancedMetricValue}>{todayMetrics.bloodOxygen}%</Text>
            <Text style={styles.advancedMetricStatus}>
              {todayMetrics.bloodOxygen >= 95 ? 'Normal' : 'Low'}
            </Text>
          </View>

          <View style={styles.advancedMetricCard}>
            <View style={styles.advancedMetricHeader}>
              <Scale color="#ec4899" size={20} />
              <Text style={styles.advancedMetricTitle}>Body Fat</Text>
            </View>
            <Text style={styles.advancedMetricValue}>{todayMetrics.bodyFatPercentage}%</Text>
            <Text style={styles.advancedMetricUnit}>Body composition</Text>
          </View>
        </View>

        {/* Body Composition Details */}
        <View style={styles.bodyCompositionContainer}>
          <Text style={styles.bodyCompositionTitle}>Body Composition Analysis</Text>
          <View style={styles.bodyCompositionGrid}>
            <View style={styles.bodyCompositionItem}>
              <Text style={styles.bodyCompositionLabel}>Muscle Mass</Text>
              <Text style={styles.bodyCompositionValue}>{todayMetrics.muscleMass}%</Text>
            </View>
            <View style={styles.bodyCompositionItem}>
              <Text style={styles.bodyCompositionLabel}>Bone Density</Text>
              <Text style={styles.bodyCompositionValue}>{todayMetrics.boneDensity}</Text>
            </View>
            <View style={styles.bodyCompositionItem}>
              <Text style={styles.bodyCompositionLabel}>Metabolic Age</Text>
              <Text style={styles.bodyCompositionValue}>{todayMetrics.metabolicAge} years</Text>
            </View>
          </View>
        </View>

        {/* Mood & Wellness Ratings */}
        <View style={styles.ratingsGrid}>
          <RatingCard
            icon={<Smile color="#f59e0b" size={24} />}
            title="Mood"
            value={todayMetrics.mood}
            color="#f59e0b"
            onChange={(value) => setLevel('mood', value)}
            labels={['Very Low', 'Low', 'Okay', 'Good', 'Excellent']}
          />
          
          <RatingCard
            icon={<Brain color="#ef4444" size={24} />}
            title="Stress Level"
            value={todayMetrics.stress}
            color="#ef4444"
            onChange={(value) => setLevel('stress', value)}
            labels={['Very Low', 'Low', 'Moderate', 'High', 'Very High']}
          />
          
          <RatingCard
            icon={<Zap color="#10b981" size={24} />}
            title="Energy Level"
            value={todayMetrics.energy}
            color="#10b981"
            onChange={(value) => setLevel('energy', value)}
            labels={['Very Low', 'Low', 'Moderate', 'High', 'Very High']}
          />
        </View>

        {/* Sleep & Toilet Trackers */}
        <View style={styles.trackersContainer}>
          <TouchableOpacity
            style={styles.trackerButton}
            onPress={() => setShowSleepModal(true)}
            testID="log-sleep-button"
          >
            <BedDouble color="#8b5cf6" size={24} />
            <Text style={styles.trackerButtonText}>Log Sleep</Text>
            <Text style={styles.trackerButtonSubtext}>
              {sleepHistory.length > 0 ? `Last: ${sleepHistory[sleepHistory.length - 1].duration.toFixed(1)}h` : 'No data'}
            </Text>
          </TouchableOpacity>

          <View style={styles.toiletTracker}>
            <View style={styles.toiletHeader}>
              <Toilet color="#06b6d4" size={24} />
              <Text style={styles.toiletTitle}>Toilet Breaks</Text>
              <Text style={styles.toiletCount}>{todayToiletEntries.length}</Text>
            </View>
            <View style={styles.toiletButtons}>
              <TouchableOpacity
                style={styles.toiletButton}
                onPress={() => saveToiletEntry('bathroom')}
                testID="bathroom-break-button"
              >
                <Text style={styles.toiletButtonText}>Bathroom</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toiletButton}
                onPress={() => saveToiletEntry('hydration')}
                testID="hydration-break-button"
              >
                <Text style={styles.toiletButtonText}>Hydration</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsContainer}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>AI Wellness Insights</Text>
            <TouchableOpacity
              style={styles.insightsToggle}
              onPress={() => setShowInsights(!showInsights)}
              testID="toggle-insights-button"
            >
              <Text style={styles.insightsToggleText}>{showInsights ? 'Hide' : 'Show'} Insights</Text>
            </TouchableOpacity>
          </View>
          
          {showInsights && (
            <View style={styles.insightsList}>
              {insights.map((insight, index) => (
                <View
                  key={index}
                  style={[
                    styles.insightItem,
                    insight.type === 'warning' ? styles.insightWarning :
                    insight.type === 'success' ? styles.insightSuccess :
                    insight.type === 'suggestion' ? styles.insightSuggestion :
                    insight.type === 'care' ? styles.insightCare :
                    insight.type === 'urgent' ? styles.insightUrgent :
                    styles.insightCelebration
                  ]}
                >
                  <View style={styles.insightIcon}>
                    {insight.icon}
                  </View>
                  <Text style={styles.insightText}>{insight.message}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <SleepModal
        visible={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={handleSaveSleep}
      />
      
      {/* Connect SmartWatch Modal */}
      <Modal visible={showConnectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect SmartWatch</Text>
              <TouchableOpacity onPress={() => setShowConnectModal(false)} style={styles.closeButton}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Select your smartwatch to sync advanced health metrics including heart rate, steps, blood pressure, and more.
            </Text>

            <View style={styles.deviceList}>
              {['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit Versa', 'Garmin Venu'].map((device) => (
                <TouchableOpacity
                  key={device}
                  style={[
                    styles.deviceOption,
                    selectedDevice === device && styles.deviceOptionSelected
                  ]}
                  onPress={() => setSelectedDevice(device)}
                  testID={`device-${device.toLowerCase().replace(' ', '-')}`}
                >
                  <Watch color={selectedDevice === device ? '#8b5cf6' : '#64748b'} size={20} />
                  <Text style={[
                    styles.deviceOptionText,
                    selectedDevice === device && styles.deviceOptionTextSelected
                  ]}>
                    {device}
                  </Text>
                  {selectedDevice === device && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.connectModalButton} 
              onPress={() => {
                connectSmartWatch(selectedDevice);
                setShowConnectModal(false);
              }}
              disabled={isConnectingWatch}
              testID="confirm-connect-button"
            >
              <Text style={styles.connectModalButtonText}>
                {isConnectingWatch ? 'Connecting...' : `Connect ${selectedDevice}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  content: {
    padding: 20,
    gap: 24,
  },
  scoreContainer: {
    marginBottom: 8,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginBottom: 20,
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreMax: {
    fontSize: 16,
    color: '#64748b',
  },
  scoreStats: {
    flex: 1,
    gap: 16,
  },
  scoreStat: {
    alignItems: 'center',
  },
  scoreStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  scoreStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scoreBadgeExcellent: {
    backgroundColor: '#10b981',
  },
  scoreBadgeGood: {
    backgroundColor: '#f59e0b',
  },
  scoreBadgeNeedsAttention: {
    backgroundColor: '#ef4444',
  },
  scoreBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  metricButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  metricButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  metricUnit: {
    fontSize: 16,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
  },
  progressTextSuccess: {
    color: '#10b981',
  },
  ratingsGrid: {
    gap: 16,
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  ratingButtonActive: {
    borderColor: 'transparent',
  },
  ratingButtonInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  ratingButtonTextInactive: {
    color: '#64748b',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  trackersContainer: {
    gap: 16,
  },
  trackerButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trackerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  trackerButtonSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  toiletTracker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toiletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  toiletTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  toiletCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  toiletButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  toiletButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toiletButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  insightsToggle: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  insightsToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  insightWarning: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
  },
  insightSuccess: {
    backgroundColor: '#d1fae5',
    borderLeftColor: '#10b981',
  },
  insightSuggestion: {
    backgroundColor: '#dbeafe',
    borderLeftColor: '#3b82f6',
  },
  insightCare: {
    backgroundColor: '#fce7f3',
    borderLeftColor: '#ec4899',
  },
  insightUrgent: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#ef4444',
  },
  insightCelebration: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
  },
  insightIcon: {
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // SmartWatch styles
  smartWatchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  smartWatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  smartWatchTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smartWatchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  connectedText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  disconnectedText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  smartWatchInfo: {
    gap: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  lastSync: {
    fontSize: 14,
    color: '#64748b',
  },
  smartWatchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  smartWatchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  syncButton: {
    backgroundColor: '#3b82f6',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  smartWatchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Advanced metrics styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  advancedMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  advancedMetricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  advancedMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  advancedMetricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  advancedMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  advancedMetricGoal: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  advancedMetricStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  advancedMetricUnit: {
    fontSize: 12,
    color: '#64748b',
  },
  // Body composition styles
  bodyCompositionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  bodyCompositionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  bodyCompositionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bodyCompositionItem: {
    alignItems: 'center',
    flex: 1,
  },
  bodyCompositionLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  bodyCompositionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  // Modal styles
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  deviceList: {
    gap: 12,
    marginBottom: 24,
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  deviceOptionSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f3f4f6',
  },
  deviceOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  deviceOptionTextSelected: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
  },
  connectModalButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});