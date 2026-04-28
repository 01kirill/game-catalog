import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';

import { auth } from '@/services/firebaseConfig';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#111827' : '#f3f4f6';
    const textColor = isDark ? '#ffffff' : '#111827';
    const inputBg = isDark ? '#1f2937' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#d1d5db';
    const iconColor = isDark ? '#9ca3af' : '#6b7280';

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) return Alert.alert(t('common.error'), t('auth.emptyFields'));
        if (password !== confirmPassword) return Alert.alert(t('common.error'), t('auth.passMismatch'));

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert(t('common.success'), t('auth.regSuccess'), [
                { text: "OK", onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <Text style={[styles.title, { color: textColor }]}>{t('auth.registerTitle')}</Text>

                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                    placeholder={t('auth.email')} placeholderTextColor="#9ca3af"
                    value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
                />

                <View style={[styles.passwordContainer, { backgroundColor: inputBg, borderColor }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: textColor }]}
                        placeholder={t('auth.password')} placeholderTextColor="#9ca3af"
                        value={password} onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        {showPassword ? <EyeOff size={24} color={iconColor} /> : <Eye size={24} color={iconColor} />}
                    </TouchableOpacity>
                </View>

                <View style={[styles.passwordContainer, { backgroundColor: inputBg, borderColor }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: textColor }]}
                        placeholder={t('auth.confirmPassword')} placeholderTextColor="#9ca3af"
                        value={confirmPassword} onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                        {showConfirmPassword ? <EyeOff size={24} color={iconColor} /> : <Eye size={24} color={iconColor} />}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleRegister}>
                    <Text style={styles.btnText}>{t('auth.registerBtn')}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={[styles.link, { color: '#10b981' }]}>{t('auth.goToLogin')}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
    input: { width: '100%', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1 },
    passwordContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, marginBottom: 16 },
    passwordInput: { flex: 1, padding: 16, fontSize: 16 },
    eyeBtn: { padding: 16 },
    btn: { width: '100%', backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { fontSize: 16, fontWeight: '600' }
});