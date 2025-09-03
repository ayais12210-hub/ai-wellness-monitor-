import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

const AUTH_STORAGE_KEY = 'wellness_auth_user';

// Mock Google OAuth for demo purposes
const mockGoogleAuth = async (): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: 'mock_user_123',
    name: 'John Wellness',
    email: 'john@wellness.com',
    picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    accessToken: 'mock_access_token_123'
  };
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isSignedIn: false
  });

  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isSignedIn: true
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (Platform.OS === 'web') {
        // For web, use mock authentication
        const user = await mockGoogleAuth();
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setAuthState({
          user,
          isLoading: false,
          isSignedIn: true
        });
      } else {
        // For mobile, use WebBrowser to simulate OAuth flow
        const result = await WebBrowser.openAuthSessionAsync(
          'https://accounts.google.com/oauth/authorize?client_id=demo&redirect_uri=exp://localhost&response_type=code&scope=profile%20email',
          'exp://localhost'
        );
        
        if (result.type === 'success') {
          // In a real app, you'd exchange the code for tokens
          const user = await mockGoogleAuth();
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
          setAuthState({
            user,
            isLoading: false,
            isSignedIn: true
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState({
        user: null,
        isLoading: false,
        isSignedIn: false
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) return;
    
    try {
      const updatedUser = { ...authState.user, ...updates };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }, [authState.user]);

  return useMemo(() => ({
    ...authState,
    signInWithGoogle,
    signOut,
    updateProfile
  }), [authState, signInWithGoogle, signOut, updateProfile]);
});