import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, Image, Share } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Star, Calendar, Gamepad2, Edit2, Search, Bell, ArrowUp, ArrowDown, Share2 } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

import { getStudios } from '@/database/db';
import { db } from '@/services/firebaseConfig';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGamesTools } from '@/hooks/useGameTools';
import { Game, Studio } from '@/types';

export default function GamesScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();

    const [games, setGames] = useState<Game[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);

    const {
        processedGames, availableGenres,
        searchQuery, setSearchQuery,
        sortField, sortDirection, toggleSort,
        genreFilter, setGenreFilter
    } = useGamesTools(games);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const descColor = isDark ? '#9ca3af' : '#4b5563';
    const borderColor = isDark ? '#374151' : '#d1d5db';

    useEffect(() => {
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') console.log(t('notifications.noPermission'));
        })();
    }, []);

    useEffect(() => {
        console.log('📡 Подключаемся к Firebase...');
        const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`Скачано игр из облака: ${snapshot.size}`); // Увидишь количество в консоли

            const cloudGames = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id as any,
                    title: data.title || 'No Title',
                    genre: data.genre || '',
                    releaseYear: data.releaseYear || 0,
                    rating: data.rating || 0,
                    studioId: data.studioId || 0,
                    imageUrl: data.imageUrl || null,
                } as Game;
            });
            setGames(cloudGames);
        }, (error) => {
            console.error('❌ Ошибка Firestore:', error); // Если нет индекса, тут будет ссылка на его создание
        });

        return () => unsubscribe();
    }, []);

    useFocusEffect(
        useCallback(() => {
            setStudios(getStudios());
        }, [])
    );

    const handleDelete = (id: string, title: string) => {
        Alert.alert(t('common.cancel'), `${t('games.delete')} "${title}"?`, [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('games.delete'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'games', id));
                    } catch (error) {
                        Alert.alert(t('common.error'), 'Не удалось удалить игру из облака');
                    }
                }
            }
        ]);
    };

    const scheduleNotification = async (title: string) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: t('notifications.scheduledTitle'),
                body: t('notifications.scheduledBody', { title }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 10,
            },
        });
        Alert.alert(t('notifications.alertTitle'), t('notifications.alertBody', { title }));
    };

    const shareGame = async (game: Game) => {
        try {
            await Share.share({
                message: t('games.shareMessage', {
                    title: game.title,
                    genre: game.genre,
                    rating: game.rating
                }),
            });
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        }
    };

    const getStudioName = (studioId: number) => {
        const studio = studios.find(s => s.id === studioId);
        return studio ? studio.name : 'Unknown Studio';
    };

    const renderItem = ({ item }: { item: Game }) => (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            {item.imageUrl && (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: '100%', height: 150, borderRadius: 12, marginBottom: 12 }}
                />
            )}

            <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
                <View style={styles.actionButtons}>

                    <TouchableOpacity onPress={() => shareGame(item)} style={{ marginRight: 16 }}>
                        <Share2 size={20} color="#3b82f6" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => scheduleNotification(item.title)} style={{ marginRight: 16 }}>
                        <Bell size={20} color="#f59e0b" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id.toString(), item.title)}>
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.studioName, { color: '#10b981' }]}>{getStudioName(item.studioId)}</Text>

            <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
                    <Gamepad2 size={14} color={descColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: descColor }]}>{item.genre || 'N/A'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
                    <Calendar size={14} color={descColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: descColor }]}>{item.releaseYear || 'N/A'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
                    <Star size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: descColor }]}>{Number(item.rating).toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.toolsContainer}>
                <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}>
                    <Search size={20} color={descColor} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder={t('tools.searchGames')}
                        placeholderTextColor={descColor}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.sortRow}>
                    {(['title', 'rating', 'year'] as const).map(field => (
                        <TouchableOpacity
                            key={field}
                            onPress={() => toggleSort(field)}
                            style={[styles.sortBtn, { borderColor }, sortField === field && styles.sortBtnActive]}
                        >
                            <Text style={[styles.sortText, { color: textColor }, sortField === field && styles.sortTextActive]}>
                                {field === 'title' ? t('tools.sortName') : field === 'rating' ? t('tools.sortRating') : t('tools.sortYear')}
                            </Text>
                            {sortField === field && (
                                sortDirection === 'asc' ? <ArrowUp size={14} color="#fff" style={{ marginLeft: 4 }}/> : <ArrowDown size={14} color="#fff" style={{ marginLeft: 4 }}/>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.filterRow}>
                    <Text style={[styles.filterLabel, { color: descColor }]}>{t('tools.filterGenre')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            onPress={() => setGenreFilter(null)}
                            style={[styles.filterChip, genreFilter === null ? styles.filterChipActive : { backgroundColor: cardBg, borderColor }]}
                        >
                            <Text style={genreFilter === null ? styles.filterTextActive : { color: textColor }}>{t('tools.filterAll')}</Text>
                        </TouchableOpacity>
                        {availableGenres.map((genre: string) => (
                            <TouchableOpacity
                                key={genre}
                                onPress={() => setGenreFilter(genre)}
                                style={[styles.filterChip, genreFilter === genre ? styles.filterChipActive : { backgroundColor: cardBg, borderColor }]}
                            >
                                <Text style={genreFilter === genre ? styles.filterTextActive : { color: textColor }}>{genre}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={processedGames}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-game')}>
                <Plus size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    toolsContainer: { padding: 16, paddingBottom: 0 },
    searchBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 16 },
    sortRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    sortBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
    sortBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    sortText: { fontSize: 14 },
    sortTextActive: { color: '#fff', fontWeight: 'bold' },
    filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    filterLabel: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 8 },
    filterChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    filterTextActive: { color: '#fff', fontWeight: 'bold' },
    list: { padding: 16, paddingBottom: 100 },
    card: { borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
    actionButtons: { flexDirection: 'row', alignItems: 'center' },
    studioName: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    badgesRow: { flexDirection: 'row' },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});