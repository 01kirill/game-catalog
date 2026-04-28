import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDCXEAHXXO4gAdRhmizSsI9paNEADlaSWg",
    authDomain: "gamecatalog-ec6c6.firebaseapp.com",
    projectId: "gamecatalog-ec6c6",
    storageBucket: "gamecatalog-ec6c6.firebasestorage.app",
    messagingSenderId: "1044258110688",
    appId: "1:1044258110688:web:5a7e5e944d261cc975e485",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
