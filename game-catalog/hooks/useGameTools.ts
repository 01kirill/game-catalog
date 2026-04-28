import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Game } from '@/types';

export type SortField = 'title' | 'rating' | 'year';
export type SortDirection = 'asc' | 'desc';

export const useGamesTools = (initialGames: Game[]) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('title');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [genreFilter, setGenreFilter] = useState<string | null>(null);

    const availableGenres = useMemo(() => {
        const genres = initialGames.map(g => g.genre).filter(Boolean);
        return Array.from(new Set(genres)).sort();
    }, [initialGames]);

    const fuse = useMemo(() => new Fuse(initialGames, {
        keys: ['title', 'genre'],
        threshold: 0.3, distance: 100,
    }), [initialGames]);

    const processedGames = useMemo(() => {
        let result = initialGames;

        if (searchQuery.trim()) {
            result = fuse.search(searchQuery).map(res => res.item);
        }

        if (genreFilter) {
            result = result.filter(game => game.genre === genreFilter);
        }

        const modifier = sortDirection === 'asc' ? 1 : -1;
        result = [...result].sort((a, b) => {
            if (sortField === 'rating') return (a.rating - b.rating) * modifier;
            if (sortField === 'year') return ((a.releaseYear || 0) - (b.releaseYear || 0)) * modifier;
            return a.title.localeCompare(b.title) * modifier;
        });

        return result;
    }, [initialGames, searchQuery, genreFilter, sortField, sortDirection, fuse]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    return {
        processedGames, availableGenres,
        searchQuery, setSearchQuery,
        sortField, sortDirection, toggleSort,
        genreFilter, setGenreFilter
    };
};
