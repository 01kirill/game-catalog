import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const FirebaseService = {
    saveGameToCloud: async (gameData: any) => {
        try {
            const docRef = await addDoc(collection(db, 'games'), gameData);
            return docRef.id;
        } catch (error) {
            throw error;
        }
    }
};
