import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MoodEntry, MoodType } from '@/hooks/wellness-store';

interface MoodChartProps {
  data: MoodEntry[];
}

const { width } = Dimensions.get('window');
const chartWidth = width - 80;

const MOOD_VALUES: Record<MoodType, number> = {
  struggling: 1,
  low: 2,
  okay: 3,
  good: 4,
  amazing: 5,
};

const MOOD_COLORS: Record<MoodType, string> = {
  struggling: '#ef4444',
  low: '#f97316',
  okay: '#f59e0b',
  good: '#3b82f6',
  amazing: '#10b981',
};

export function MoodChart({ data }: MoodChartProps) {
  const last7Days = data.slice(-7);
  const maxValue = 5;
  const chartHeight = 120;

  if (last7Days.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mood Trends</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Start tracking your mood to see trends</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Trends (Last 7 Days)</Text>
      
      <View style={styles.chart}>
        <View style={styles.yAxis}>
          {[5, 4, 3, 2, 1].map((value) => (
            <Text key={value} style={styles.yAxisLabel}>
              {value === 5 ? '😊' : value === 3 ? '😐' : value === 1 ? '😔' : ''}
            </Text>
          ))}
        </View>
        
        <View style={styles.chartArea}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3, 4].map((line) => (
              <View key={line} style={styles.gridLine} />
            ))}
          </View>
          
          <View style={styles.dataPoints}>
            {last7Days.map((entry, index) => {
              const value = MOOD_VALUES[entry.mood];
              const height = (value / maxValue) * chartHeight;
              const left = (index / Math.max(last7Days.length - 1, 1)) * (chartWidth - 40);
              
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.dataPoint,
                    {
                      left,
                      bottom: height - 6,
                      backgroundColor: MOOD_COLORS[entry.mood],
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
      
      <View style={styles.xAxis}>
        {last7Days.map((entry, index) => (
          <Text key={entry.id} style={styles.xAxisLabel}>
            {new Date(entry.date).toLocaleDateString('en', { weekday: 'short' })}
          </Text>
        ))}
      </View>
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    height: 120,
    marginBottom: 16,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  yAxisLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dataPoints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyState: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});