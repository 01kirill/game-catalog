import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { initDatabase } from '../database/db';
import '../locales/i18n';
import i18n from '../locales/i18n';
import { useSettingsStore } from '../store/useSettingsStore';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const { theme, language } = useSettingsStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const prepareApp = async () => {
            try {
                initDatabase();

                if (language) {
                    i18n.changeLanguage(language);
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (e) {
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        };

        prepareApp();
    }, [language]);

    if (!isReady) {
        return null;
    }

    return (
        <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="add-studio" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="add-game" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}
