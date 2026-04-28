import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { LogOut, User } from 'lucide-react-native';

import { useSettingsStore } from '@/store/useSettingsStore';
import { auth } from '@/services/firebaseConfig';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme, language, setLanguage } = useSettingsStore();

    const isDark = theme === 'dark';

    const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

    const toggleLanguage = () => {
        const newLang = language === 'ru' ? 'en' : 'ru';
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
    };

    const isDarkColors = {
        textColor: isDark ? '#ffffff' : '#111827',
        bgColor: isDark ? '#111827' : '#f3f4f6',
        cardBg: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        mutedColor: isDark ? '#9ca3af' : '#6b7280',
    };

    const currentUser = auth.currentUser;

    return (
        <View style={[styles.container, { backgroundColor: isDarkColors.bgColor }]}>

            <View style={[styles.card, { backgroundColor: isDarkColors.cardBg, borderColor: isDarkColors.borderColor, marginBottom: 16 }]}>
                <View style={styles.profileRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
                        <User size={32} color={isDarkColors.textColor} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileLabel, { color: isDarkColors.mutedColor }]}>
                            {t('auth.loginTitle')}
                        </Text>
                        <Text style={[styles.profileEmail, { color: isDarkColors.textColor }]}>
                            {currentUser?.email || 'Гость'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.card, { backgroundColor: isDarkColors.cardBg, borderColor: isDarkColors.borderColor }]}>

                <View style={styles.row}>
                    <Text style={[styles.text, { color: isDarkColors.textColor }]}>{t('settings.theme')}</Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#d1d5db', true: '#10b981' }}
                    />
                </View>

                <View style={[styles.divider, { backgroundColor: isDarkColors.borderColor }]} />

                <View style={styles.row}>
                    <Text style={[styles.text, { color: isDarkColors.textColor }]}>{t('settings.language')}</Text>
                    <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
                        <Text style={styles.langText}>{language === 'ru' ? 'RU' : 'EN'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.divider, { backgroundColor: isDarkColors.borderColor }]} />

                <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutBtn}>
                    <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>{t('auth.logout')}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    profileEmail: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
    langButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    langText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        justifyContent: 'center',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
