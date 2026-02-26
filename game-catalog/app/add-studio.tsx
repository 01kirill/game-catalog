import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { addStudio, updateStudio, getStudioById } from '../database/db';
import { useSettingsStore } from '../store/useSettingsStore';

export default function AddStudioScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();
    const params = useLocalSearchParams();
    const editId = params.id ? Number(params.id) : null;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState('');

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const inputBg = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    const placeholderColor = isDark ? '#9ca3af' : '#6b7280';


    useEffect(() => {
        if (editId) {
            const studio = getStudioById(editId);
            if (studio) {
                setName(studio.name);
                setDescription(studio.description);
                setRating(studio.rating.toString());
            }
        }
    }, [editId]);

    const handleSave = () => {
        if (!name.trim()) return;

        let ratingNum = parseFloat(rating.replace(',', '.'));
        if (isNaN(ratingNum)) ratingNum = 0;
        if (ratingNum > 5) ratingNum = 5;

        ratingNum = Math.round(ratingNum * 100) / 100;

        if (editId) {
            updateStudio(editId, name, description, ratingNum);
        } else {
            addStudio(name, description, ratingNum);
        }
        router.back();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <Text style={[styles.title, { color: textColor }]}>
                    {editId ? t('studios.edit') : t('studios.add')}
                </Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder={t('studios.namePlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor }]}
                    placeholder={t('studios.descPlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={description}
                    onChangeText={setDescription}
                    multiline numberOfLines={4}
                />
                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder={t('studios.ratingPlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="decimal-pad"
                    maxLength={4}
                />
                <TouchableOpacity style={[styles.button, { opacity: name.trim() ? 1 : 0.5 }]} onPress={handleSave} disabled={!name.trim()}>
                    <Text style={styles.buttonText}>{t('studios.save')}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    button: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
