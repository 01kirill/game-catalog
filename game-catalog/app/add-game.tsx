import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, CloudUpload } from 'lucide-react-native';

import { addGame, updateGame, getGameById, getStudios } from '@/database/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { FirebaseService } from '@/services/firebaseService';
import { Studio } from '@/types';

export default function AddGameScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();
    const params = useLocalSearchParams();
    const editId = params.id ? Number(params.id) : null;

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const [studios, setStudios] = useState<Studio[]>([]);
    const [selectedStudioId, setSelectedStudioId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const inputBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const placeholderColor = isDark ? '#9ca3af' : '#6b7280';
    const borderColor = isDark ? '#374151' : '#d1d5db';

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
                if (game.imageUrl) setImageUri(game.imageUrl);
            }
        }
    }, [editId]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.1,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleCloudSave = async () => {
        if (!title.trim() || !selectedStudioId) return;
        setIsUploading(true);

        try {
            const releaseYear = parseInt(year) || 2024;
            let ratingNum = parseFloat(rating.replace(',', '.')) || 0;
            if (ratingNum > 5) ratingNum = 5;
            ratingNum = Math.round(ratingNum * 100) / 100;

            const gameData = {
                title, genre, releaseYear, rating: ratingNum,
                studioId: selectedStudioId,
                imageUrl: imageBase64 || imageUri,
                updatedAt: new Date().toISOString()
            };

            await FirebaseService.saveGameToCloud(gameData);

            if (editId) {
                updateGame(editId, title, genre, releaseYear, ratingNum, selectedStudioId, imageBase64 || imageUri || undefined);
            } else {
                addGame(title, genre, releaseYear, ratingNum, selectedStudioId, imageBase64 || imageUri || undefined);
            }

            Alert.alert(t('common.success'), t('games.cloudSuccess'));
            router.back();
        } catch (e) {
            Alert.alert(t('common.error'), t('games.cloudError'));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
                <Text style={[styles.title, { color: textColor }]}>
                    {editId ? t('games.edit') : t('games.add')}
                </Text>

                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor, borderWidth: 1 }]}
                    placeholder={t('games.titlePlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor, borderWidth: 1 }]}
                    placeholder={t('games.genrePlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={genre}
                    onChangeText={setGenre}
                />

                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: inputBg, color: textColor, borderColor, borderWidth: 1 }]}
                        placeholder={t('games.yearPlaceholder')}
                        placeholderTextColor={placeholderColor}
                        value={year}
                        onChangeText={setYear}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={[styles.input, { flex: 1, marginLeft: 8, backgroundColor: inputBg, color: textColor, borderColor, borderWidth: 1 }]}
                        placeholder={t('games.ratingPlaceholder')}
                        placeholderTextColor={placeholderColor}
                        value={rating}
                        onChangeText={setRating}
                        keyboardType="decimal-pad"
                    />
                </View>

                <Text style={[styles.label, { color: textColor }]}>{t('games.selectStudio')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studioList}>
                    {studios.map((studio) => {
                        const isSelected = selectedStudioId === studio.id;
                        return (
                            <TouchableOpacity
                                key={studio.id}
                                style={[styles.studioChip, isSelected ? styles.studioChipSelected : { backgroundColor: inputBg, borderColor }]}
                                onPress={() => setSelectedStudioId(studio.id)}
                            >
                                <Text style={[styles.studioChipText, { color: isSelected ? '#fff' : textColor }]}>{studio.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <TouchableOpacity onPress={pickImage} style={[styles.imageBtn, { backgroundColor: inputBg, borderColor, borderWidth: 1 }]}>
                    <ImageIcon size={24} color={textColor} style={{ marginRight: 8 }} />
                    <Text style={{ color: textColor }}>{imageUri ? t('games.changeImage') : t('games.pickImage')}</Text>
                </TouchableOpacity>

                {imageUri && (
                    <View style={[styles.imagePreview, { borderColor }]}>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, { opacity: (title.trim() && selectedStudioId && !isUploading) ? 1 : 0.5 }]}
                    onPress={handleCloudSave}
                    disabled={!title.trim() || !selectedStudioId || isUploading}
                >
                    {isUploading ? <ActivityIndicator color="#fff" /> : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CloudUpload size={24} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveBtnText}>{t('games.saveCloud')}</Text>
                        </View>
                    )}
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
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    studioList: { flexDirection: 'row', marginBottom: 24 },
    studioChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1 },
    studioChipSelected: { backgroundColor: '#10b981', borderColor: '#10b981' },
    studioChipText: { fontSize: 14, fontWeight: 'bold' },
    imageBtn: { borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    imagePreview: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderWidth: 1 },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    saveBtn: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});