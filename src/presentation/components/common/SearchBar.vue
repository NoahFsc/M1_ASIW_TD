<script setup lang="ts">
defineProps<{
    modelValue: string;
    placeholder?: string;
}>();

defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
    <div class="search-container">
        <i class="bi bi-search search-icon"></i>
        <input 
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text" 
            class="search-input" 
            :placeholder="placeholder || 'Rechercher...'"
        >
    </div>
</template>
