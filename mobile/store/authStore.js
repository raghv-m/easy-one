import { create } from 'zustand';
import { getFirebaseAuth } from '../config/firebase';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  signup: async (email, password, name, organizationName) => {
    try {
      set({ error: null });
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        name,
        organizationName,
      });

      const { token } = response.data;
      const auth = getFirebaseAuth();
      await signInWithCustomToken(auth, token);

      set({
        token,
        user: response.data.user,
        loading: false,
      });

      await AsyncStorage.setItem('token', token);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      set({ error: message, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      set({ error: null });
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      const auth = getFirebaseAuth();
      await signInWithCustomToken(auth, token);

      set({
        token,
        user,
        loading: false,
      });

      await AsyncStorage.setItem('token', token);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      set({ user: null, token: null });
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: response.data.user, token, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
      set({ loading: false });
    }
  },
}));

