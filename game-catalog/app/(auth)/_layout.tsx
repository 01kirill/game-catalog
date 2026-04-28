import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function AuthLayout() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: bgColor },
                headerTintColor: textColor,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: t('auth.loginTitle'),
                    headerBackVisible: false
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: t('auth.registerTitle')
                }}
            />
        </Stack>
    );
}