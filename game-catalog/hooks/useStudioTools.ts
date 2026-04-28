import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Studio } from '@/types';

export type StudioSortField = 'name' | 'rating';
export type SortDirection = 'asc' | 'desc';

export const useStudiosTools = (initialStudios: Studio[]) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<StudioSortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const fuse = useMemo(() => new Fuse(initialStudios, {
        keys: ['name', 'description'],
        threshold: 0.3, distance: 100,
    }), [initialStudios]);

    const processedStudios = useMemo(() => {
        let result = initialStudios;

        if (searchQuery.trim()) {
            result = fuse.search(searchQuery).map(res => res.item);
        }

        if (ratingFilter !== null) {
            result = result.filter(studio => Math.floor(studio.rating) === ratingFilter);
        }

        const modifier = sortDirection === 'asc' ? 1 : -1;
        result = [...result].sort((a, b) => {
            if (sortField === 'rating') return (a.rating - b.rating) * modifier;
            return a.name.localeCompare(b.name) * modifier;
        });

        return result;
    }, [initialStudios, searchQuery, ratingFilter, sortField, sortDirection, fuse]);

    const toggleSort = (field: StudioSortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    return {
        processedStudios,
        searchQuery, setSearchQuery,
        sortField, sortDirection, toggleSort,
        ratingFilter, setRatingFilter
    };
};
