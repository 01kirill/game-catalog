import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Star, Edit2} from 'lucide-react-native';

import { getStudios, deleteStudio } from '../../database/db';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Studio } from '../../types';

export default function StudiosScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();
    const [studios, setStudios] = useState<Studio[]>([]);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const descColor = isDark ? '#9ca3af' : '#4b5563';

    useFocusEffect(
        useCallback(() => {
            const loadStudios = () => {
                const data = getStudios();
                setStudios(data);
            };
            loadStudios();
        }, [])
    );

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            t('studios.delete'),
            `${t('studios.delete')} "${name}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: t('studios.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteStudio(id);
                        setStudios(getStudios());
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Studio }) => (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/add-studio', params: { id: item.id } })}>
                        <Edit2 size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {item.description ? (
                <Text style={[styles.description, { color: descColor }]}>{item.description}</Text>
            ) : null}

            <View style={styles.ratingRow}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={[styles.rating, { color: textColor }]}>{item.rating} / 5</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {studios.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: descColor }]}>{t('studios.empty')}</Text>
                </View>
            ) : (
                <FlatList
                    data={studios}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-studio')}
            >
                <Plus size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16, paddingBottom: 100 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 16, textAlign: 'center' },

    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    description: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    rating: { marginLeft: 6, fontSize: 14, fontWeight: 'bold' },

    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#10b981',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
});
