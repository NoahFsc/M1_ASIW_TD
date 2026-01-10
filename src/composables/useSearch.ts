import { computed, type Ref } from 'vue';

/**
 * Composable pour filtrer une liste d'éléments
 * Recherche dans plusieurs champs spécifiés et retourne les résultats filtrés
 * Ici utilisé pour la recherche dans les tableaux de parcours, UEs, étudiants...
 */
export function useSearch<T>(
    items: Ref<T[]>,
    searchQuery: Ref<string>,
    searchFields: (keyof T)[]
) {
    return computed(() => {
        if (!searchQuery.value) return items.value;
        
        const query = searchQuery.value.toLowerCase();
        
        return items.value.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                if (value == null) return false;
                return String(value).toLowerCase().includes(query);
            });
        });
    });
}
