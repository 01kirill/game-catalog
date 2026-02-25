import * as SQLite from 'expo-sqlite';
import { Game, Studio } from '../types';

const db = SQLite.openDatabaseSync('gamecatalog.db');

export const initDatabase = () => {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS studios (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               name TEXT NOT NULL,
                                               description TEXT,
                                               rating REAL
        );

        CREATE TABLE IF NOT EXISTS games (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             title TEXT NOT NULL,
                                             genre TEXT,
                                             releaseYear INTEGER,
                                             rating REAL,
                                             studioId INTEGER,
                                             FOREIGN KEY (studioId) REFERENCES studios (id) ON DELETE CASCADE
            );
    `);
};

export const getStudios = (): Studio[] => db.getAllSync<Studio>('SELECT * FROM studios ORDER BY name ASC;');

export const getStudioById = (id: number): Studio | null => {
    return db.getFirstSync<Studio>('SELECT * FROM studios WHERE id = ?', [id]);
};

export const addStudio = (name: string, description: string, rating: number) => {
    db.runSync('INSERT INTO studios (name, description, rating) VALUES (?, ?, ?)', [name, description, rating]);
};

export const updateStudio = (id: number, name: string, description: string, rating: number) => {
    db.runSync('UPDATE studios SET name = ?, description = ?, rating = ? WHERE id = ?', [name, description, rating, id]);
};

export const deleteStudio = (id: number) => {
    db.runSync('DELETE FROM studios WHERE id = ?', [id]);
    db.runSync('DELETE FROM games WHERE studioId = ?', [id]);
};

export const getGames = (): Game[] => db.getAllSync<Game>('SELECT * FROM games ORDER BY title ASC;');

export const getGameById = (id: number): Game | null => {
    return db.getFirstSync<Game>('SELECT * FROM games WHERE id = ?', [id]);
};

export const addGame = (title: string, genre: string, releaseYear: number, rating: number, studioId: number) => {
    db.runSync('INSERT INTO games (title, genre, releaseYear, rating, studioId) VALUES (?, ?, ?, ?, ?)', [title, genre, releaseYear, rating, studioId]);
};

export const updateGame = (id: number, title: string, genre: string, releaseYear: number, rating: number, studioId: number) => {
    db.runSync('UPDATE games SET title = ?, genre = ?, releaseYear = ?, rating = ?, studioId = ? WHERE id = ?', [title, genre, releaseYear, rating, studioId, id]);
};

export const deleteGame = (id: number) => {
    db.runSync('DELETE FROM games WHERE id = ?', [id]);
};
