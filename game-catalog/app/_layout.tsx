import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged, User } from 'firebase/auth';

import { initDatabase } from '@/database/db';
import '@/locales/i18n';
import i18n from '@/locales/i18n';
import { useSettingsStore } from '@/store/useSettingsStore';
import { auth } from '@/services/firebaseConfig'; // Импорт Firebase Auth

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { theme, language } = useSettingsStore();
    const [isReady, setIsReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const segments = useSegments();

    useEffect(() => {
        const prepareApp = async () => {
            try {
                initDatabase();
                if (language) i18n.changeLanguage(language);
            } catch (e) {
                console.error(e);
            } finally {
                setIsReady(true);
            }
        };
        prepareApp();
    }, [language]);

    useEffect(() => {
        if (!isReady) return;

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            const inAuthGroup = segments[0] === '(auth)';

            if (currentUser && inAuthGroup) {
                router.replace('/(tabs)');
            } else if (!currentUser && !inAuthGroup) {
                router.replace('/(auth)/login');
            }

            SplashScreen.hideAsync();
        });

        return () => unsubscribe();
    }, [isReady, segments]);

    if (!isReady) return null;

    return (
        <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="add-studio" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="add-game" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}