import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    theme: 'light' | 'dark';
    language: string;
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (lang: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            language: 'en',
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
