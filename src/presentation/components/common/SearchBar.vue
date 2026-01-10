<script setup lang="ts">
defineProps<{
    modelValue: string;
    placeholder?: string;
}>();

defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>

<!-- Template pour la barre de recherche générique -->
<template>
    <div class="relative mb-6">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input 
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text" 
            class="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(39,54,86,0.1)] placeholder:text-gray-400" 
            :placeholder="placeholder || 'Rechercher...'"
        >
    </div>
</template>
