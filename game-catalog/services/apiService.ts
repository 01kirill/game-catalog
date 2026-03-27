import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://www.freetogame.com/api/games';
const CACHE_KEY = '@freetogame_cache';

export const ApiService = {
    fetchGames: async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();

            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data.slice(0, 50)));

            return data.slice(0, 50);
        } catch (error) {
            throw error;
        }
    },

    getCachedGames: async () => {
        try {
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            return cachedData ? JSON.parse(cachedData) : [];
        } catch (error) {
            return [];
        }
    }
};