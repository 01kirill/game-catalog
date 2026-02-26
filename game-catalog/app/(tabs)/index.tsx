import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Star, Calendar, Gamepad2, Edit2 } from 'lucide-react-native';

import { getGames, getStudios, deleteGame } from '../../database/db';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Game, Studio } from '../../types';

export default function GamesScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();

    const [games, setGames] = useState<Game[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const descColor = isDark ? '#9ca3af' : '#4b5563';
    const badgeBg = isDark ? '#374151' : '#e5e7eb';

    useFocusEffect(
        useCallback(() => {
            const loadData = () => {
                setGames(getGames());
                setStudios(getStudios());
            };
            loadData();
        }, [])
    );

    const handleDelete = (id: number, title: string) => {
        Alert.alert(
            t('games.delete'),
            `${t('games.delete')} "${title}"?`,
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('games.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteGame(id);
                        setGames(getGames());
                    }
                }
            ]
        );
    };

    const getStudioName = (studioId: number) => {
        const studio = studios.find(s => s.id === studioId);
        return studio ? studio.name : 'Unknown Studio';
    };

    const renderItem = ({ item }: { item: Game }) => (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/add-game', params: { id: item.id } })}
                        style={{ marginRight: 16 }}
                    >
                        <Edit2 size={20} color="#3b82f6" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}>
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.studioName, { color: '#10b981' }]}>{getStudioName(item.studioId)}</Text>

            <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Gamepad2 size={14} color={descColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: descColor }]}>{item.genre || 'N/A'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Calendar size={14} color={descColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: descColor }]}>{item.releaseYear || 'N/A'}</Text>
                </View>
            </View>

            <View style={styles.ratingRow}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={[styles.rating, { color: textColor }]}>{Number(item.rating).toFixed(2)} / 5</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {games.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: descColor }]}>{t('games.empty')}</Text>
                </View>
            ) : (
                <FlatList
                    data={games}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-game')}>
                <Plus size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16, paddingBottom: 100 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },

    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
    actionButtons: { flexDirection: 'row', alignItems: 'center' },
    studioName: { fontSize: 14, fontWeight: '600', marginBottom: 12 },

    badgesRow: { flexDirection: 'row', marginBottom: 12 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },

    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    rating: { marginLeft: 6, fontSize: 14, fontWeight: 'bold' },

    fab: {
        position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
});
