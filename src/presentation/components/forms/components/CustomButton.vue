<script setup lang="ts">
defineProps<{
    variant?: 'submit' | 'cancel'
}>();
</script>

<template>
    <button 
        :type="variant === 'submit' ? 'submit' : 'button'" 
        :class="variant === 'submit' ? 'bg-primary hover:bg-primary-hover px-6 py-2.5 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors font-[Outfit]' : 'px-6 py-2.5 border-2 border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 font-[Outfit]'"
    >
        <slot />
    </button>
</template>