import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { addGame, updateGame, getGameById, getStudios } from '../database/db';
import { useSettingsStore } from '../store/useSettingsStore';
import { Studio } from '../types';

export default function AddGameScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();

    const params = useLocalSearchParams();
    const editId = params.id ? Number(params.id) : null;

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');

    const [studios, setStudios] = useState<Studio[]>([]);
    const [selectedStudioId, setSelectedStudioId] = useState<number | null>(null);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const inputBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const placeholderColor = isDark ? '#9ca3af' : '#6b7280';

    useEffect(() => {
        setStudios(getStudios());

        if (editId) {
            const game = getGameById(editId);
            if (game) {
                setTitle(game.title);
                setGenre(game.genre);
                setYear(game.releaseYear.toString());
                setRating(game.rating.toString());
                setSelectedStudioId(game.studioId);
            }
        }
    }, [editId]);

    const handleSave = () => {
        if (!title.trim() || !selectedStudioId) return;

        const releaseYear = parseInt(year) || 2024;

        let ratingNum = parseFloat(rating.replace(',', '.'));
        if (isNaN(ratingNum)) ratingNum = 0;
        if (ratingNum > 5) ratingNum = 5;

        ratingNum = Math.round(ratingNum * 100) / 100;

        if (editId) {
            updateGame(editId, title, genre, releaseYear, ratingNum, selectedStudioId);
        } else {
            addGame(title, genre, releaseYear, ratingNum, selectedStudioId);
        }

        router.back();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
                <Text style={[styles.title, { color: textColor }]}>
                    {editId ? t('games.edit') : t('games.add')}
                </Text>

                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder={t('games.titlePlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder={t('games.genrePlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={genre}
                    onChangeText={setGenre}
                />

                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: inputBg, color: textColor }]}
                        placeholder={t('games.yearPlaceholder')}
                        placeholderTextColor={placeholderColor}
                        value={year}
                        onChangeText={setYear}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1, marginLeft: 8, backgroundColor: inputBg, color: textColor }]}
                        placeholder={t('games.ratingPlaceholder')}
                        placeholderTextColor={placeholderColor}
                        value={rating}
                        onChangeText={setRating}
                        keyboardType="decimal-pad"
                        maxLength={4}
                    />
                </View>

                <Text style={[styles.label, { color: textColor }]}>{t('games.selectStudio')}</Text>
                {studios.length === 0 ? (
                    <Text style={{ color: '#ef4444', marginBottom: 16 }}>{t('games.empty')}</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studioList}>
                        {studios.map((studio) => {
                            const isSelected = selectedStudioId === studio.id;
                            return (
                                <TouchableOpacity
                                    key={studio.id}
                                    style={[styles.studioChip, isSelected ? styles.studioChipSelected : { backgroundColor: inputBg }]}
                                    onPress={() => setSelectedStudioId(studio.id)}
                                >
                                    <Text style={[styles.studioChipText, { color: isSelected ? '#fff' : textColor }]}>
                                        {studio.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={[styles.button, { opacity: (title.trim() && selectedStudioId) ? 1 : 0.5 }]}
                    onPress={handleSave}
                    disabled={!title.trim() || !selectedStudioId}
                >
                    <Text style={styles.buttonText}>{t('games.save')}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
    studioList: { flexDirection: 'row', marginBottom: 24 },
    studioChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#374151' },
    studioChipSelected: { backgroundColor: '#10b981', borderColor: '#10b981' },
    studioChipText: { fontSize: 14, fontWeight: 'bold' },
    button: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
