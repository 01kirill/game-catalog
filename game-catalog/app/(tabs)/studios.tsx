import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Star, Edit2, Search, ArrowUp, ArrowDown } from 'lucide-react-native';

import { getStudios, deleteStudio } from '@/database/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStudiosTools } from '@/hooks/useStudioTools';
import { Studio } from '@/types';

export default function StudiosScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();
    const [studios, setStudios] = useState<Studio[]>([]);

    const {
        processedStudios,
        searchQuery, setSearchQuery,
        sortField, sortDirection, toggleSort,
        ratingFilter, setRatingFilter
    } = useStudiosTools(studios);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const descColor = isDark ? '#9ca3af' : '#4b5563';
    const borderColor = isDark ? '#374151' : '#d1d5db';

    useFocusEffect(
        useCallback(() => {
            setStudios(getStudios());
        }, [])
    );

    const handleDelete = (id: number, name: string) => {
        Alert.alert(t('common.cancel'), `${t('studios.delete')} "${name}"?`, [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('studios.delete'), style: 'destructive', onPress: () => { deleteStudio(id); setStudios(getStudios()); } }
        ]);
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
                <Text style={[styles.rating, { color: textColor }]}>{Number(item.rating).toFixed(2)} / 5</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>

            <View style={styles.toolsContainer}>
                {/* Поиск */}
                <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}>
                    <Search size={20} color={descColor} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder={t('tools.searchStudios')}
                        placeholderTextColor={descColor}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Сортировка */}
                <View style={styles.sortRow}>
                    {(['name', 'rating'] as const).map(field => (
                        <TouchableOpacity
                            key={field}
                            onPress={() => toggleSort(field)}
                            style={[styles.sortBtn, { borderColor }, sortField === field && styles.sortBtnActive]}
                        >
                            <Text style={[styles.sortText, { color: textColor }, sortField === field && styles.sortTextActive]}>
                                {field === 'name' ? t('tools.sortName') : t('tools.sortRating')}
                            </Text>
                            {sortField === field && (
                                sortDirection === 'asc' ? <ArrowUp size={14} color="#fff" style={{ marginLeft: 4 }}/> : <ArrowDown size={14} color="#fff" style={{ marginLeft: 4 }}/>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Фильтрация по звездам (5, 4, 3, 2, 1) */}
                <View style={styles.filterRow}>
                    <Text style={[styles.filterLabel, { color: descColor }]}>{t('tools.filterRating')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            onPress={() => setRatingFilter(null)}
                            style={[styles.filterChip, ratingFilter === null ? styles.filterChipActive : { backgroundColor: cardBg, borderColor }]}
                        >
                            <Text style={ratingFilter === null ? styles.filterTextActive : { color: textColor }}>{t('tools.filterAll')}</Text>
                        </TouchableOpacity>
                        {[5, 4, 3, 2, 1].map(stars => (
                            <TouchableOpacity
                                key={stars}
                                onPress={() => setRatingFilter(stars)}
                                style={[styles.filterChip, ratingFilter === stars ? styles.filterChipActive : { backgroundColor: cardBg, borderColor }]}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={ratingFilter === stars ? styles.filterTextActive : { color: textColor }}>{stars} </Text>
                                    <Star size={12} color={ratingFilter === stars ? '#fff' : '#fbbf24'} fill={ratingFilter === stars ? '#fff' : '#fbbf24'} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={processedStudios}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-studio')}>
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    description: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    rating: { marginLeft: 6, fontSize: 14, fontWeight: 'bold' },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});