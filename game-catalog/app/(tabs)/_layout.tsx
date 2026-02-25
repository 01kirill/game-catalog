import { Tabs } from 'expo-router';
import { Gamepad2, Building2, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function TabLayout() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();

    const isDark = theme === 'dark';

    const activeColor = isDark ? '#10b981' : '#059669';
    const bgColor = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';
    const borderColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: activeColor,
                tabBarStyle: {
                    backgroundColor: bgColor,
                    borderTopColor: borderColor,
                },
                headerStyle: {
                    backgroundColor: bgColor,
                },
                headerTintColor: textColor,
            }}>

            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.games'),
                    tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="studios"
                options={{
                    title: t('tabs.studios'),
                    tabBarIcon: ({ color }) => <Building2 size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: t('tabs.settings'),
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
