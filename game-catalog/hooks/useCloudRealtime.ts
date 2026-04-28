import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';

export const useCloudRealtime = () => {
    const [cloudGames, setCloudGames] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const gamesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCloudGames(gamesList);
        });

        return () => unsubscribe();
    }, []);

    return { cloudGames };
};