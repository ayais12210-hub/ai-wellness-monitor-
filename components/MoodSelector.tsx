import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { useWellness, MoodType } from '@/hooks/wellness-store';

interface MoodSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'amazing', emoji: '🤩', label: 'Amazing', color: '#10b981' },
  { type: 'good', emoji: '😊', label: 'Good', color: '#3b82f6' },
  { type: 'okay', emoji: '😐', label: 'Okay', color: '#f59e0b' },
  { type: 'low', emoji: '😔', label: 'Low', color: '#f97316' },
  { type: 'struggling', emoji: '😢', label: 'Struggling', color: '#ef4444' },
];

export function MoodSelector({ visible, onClose }: MoodSelectorProps) {
  const { saveMood, isSavingMood, generateMotivation } = useWellness();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');

  const handleMoodSelect = (mood: MoodType) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedMood(mood);
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    await saveMood(selectedMood, note);
    generateMotivation(selectedMood);
    
    setSelectedMood(null);
    setNote('');
    onClose();
  };

  const handleClose = () => {
    setSelectedMood(null);
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling?</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            testID="close-mood-selector"
          >
            <X color="#64748b" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.moodButton,
                selectedMood === mood.type && { 
                  borderColor: mood.color,
                  borderWidth: 3,
                  transform: [{ scale: 1.05 }],
                },
              ]}
              onPress={() => handleMoodSelect(mood.type)}
              testID={`mood-${mood.type}`}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMood && (
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Add a note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What's on your mind?"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={200}
              testID="mood-note-input"
            />
          </View>
        )}

        {selectedMood && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSavingMood}
            testID="save-mood-button"
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveButtonText}>
                {isSavingMood ? 'Saving...' : 'Save Check-in'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  moodButton: {
    width: '28%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});