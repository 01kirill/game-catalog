import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react-native';

import { useExploreGames } from '@/hooks/useExploreGames';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ExploreScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();

    const { games, loading, isOffline, refresh } = useExploreGames();

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const descColor = isDark ? '#9ca3af' : '#4b5563';

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Image source={{ uri: item.thumbnail }} style={styles.image} />
            <View style={styles.cardInfo}>
                <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
                <Text style={[styles.genre, { color: '#10b981' }]}>{item.genre} • {item.platform}</Text>
                <Text style={[styles.publisher, { color: descColor }]}>{item.publisher}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <WifiOff size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.offlineText}>{t('explore.offline')}</Text>
                </View>
            )}

            {loading && games.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <FlatList
                    data={games}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    offlineBanner: { flexDirection: 'row', backgroundColor: '#ef4444', padding: 8, justifyContent: 'center', alignItems: 'center' },
    offlineText: { color: '#fff', fontWeight: 'bold' },
    list: { padding: 16 },
    card: { borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3 },
    image: { width: '100%', height: 150, resizeMode: 'cover' },
    cardInfo: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    genre: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    publisher: { fontSize: 12 },
});