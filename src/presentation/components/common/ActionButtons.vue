<script setup lang="ts">
export interface ActionButton {
    type: 'edit' | 'delete' | 'view';
    onClick: () => void;
}

defineProps<{
    actions: ActionButton[];
}>();

const getIconClass = (type: ActionButton['type']) => {
    switch (type) {
        case 'edit': return 'fa-pen';
        case 'delete': return 'fa-trash';
        case 'view': return 'fa-eye';
    }
};

const getColorClass = (type: ActionButton['type']) => {
    switch (type) {
        case 'edit': return 'text-blue-600 hover:bg-blue-100';
        case 'delete': return 'text-red-600 hover:bg-red-100';
        case 'view': return 'text-blue-600 hover:bg-blue-100';
    }
};

const getTooltip = (type: ActionButton['type']) => {
    switch (type) {
        case 'edit': return 'Modifier';
        case 'delete': return 'Supprimer';
        case 'view': return 'Voir les détails';
    }
};
</script>

<!-- Template générique pour les boutons d'actions des tableaux -->
<template>
    <div class="flex items-center justify-center gap-1">
        <button
            v-for="(action, index) in actions"
            :key="index"
            class="w-8 h-8 flex items-center justify-center rounded cursor-pointer relative group"
            :class="getColorClass(action.type)"
            @click="action.onClick"
        >
            <i class="fa-solid" :class="getIconClass(action.type)"></i>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                {{ getTooltip(action.type) }}
            </span>
        </button>
    </div>
</template>
