<script setup lang="ts">
defineProps<{
    icon: string;
    iconColor: string;
    iconBgColor: string;
    value: string | number;
    label: string;
}>();
</script>

<!-- Template pour les cartes du tableau de bord -->
<template>
    <div class="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-5">
        <div 
            class="size-16 rounded-lg flex items-center justify-center text-3xl shrink-0"
            :class="[iconBgColor, iconColor]"
        >
            <i class="fa-solid" :class="icon"></i>
        </div>
        <div class="flex-1">
            <div class="text-3xl font-bold text-gray-900 leading-none">{{ value }}</div>
            <div class="text-sm text-gray-600 mt-2">{{ label }}</div>
        </div>
    </div>
</template>
