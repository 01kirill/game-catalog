import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/useSettingsStore';

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

    const textColor = isDark ? '#ffffff' : '#111827';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>

                <View style={styles.row}>
                    <Text style={[styles.text, { color: textColor }]}>{t('settings.theme')}</Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#d1d5db', true: '#10b981' }}
                    />
                </View>

                <View style={[styles.divider, { backgroundColor: borderColor }]} />

                <View style={styles.row}>
                    <Text style={[styles.text, { color: textColor }]}>{t('settings.language')}</Text>
                    <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
                        <Text style={styles.langText}>{language === 'ru' ? 'RU' : 'EN'}</Text>
                    </TouchableOpacity>
                </View>

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
});
