import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ApiService } from '@/services/apiService';

export const useExploreGames = () => {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = !(state.isConnected && state.isInternetReachable);
            setIsOffline(offline);
            loadData(offline);
        });

        return () => unsubscribe();
    }, []);

    const loadData = async (offline: boolean) => {
        setLoading(true);
        try {
            if (offline) {
                const cached = await ApiService.getCachedGames();
                setGames(cached);
            } else {
                const freshData = await ApiService.fetchGames();
                setGames(freshData);
            }
        } catch (error) {
            const cached = await ApiService.getCachedGames();
            setGames(cached);
            setIsOffline(true);
        } finally {
            setLoading(false);
        }
    };

    return { games, loading, isOffline, refresh: () => loadData(isOffline) };
};