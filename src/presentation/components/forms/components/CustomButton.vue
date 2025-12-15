<script setup lang="ts">
defineProps<{
    variant?: 'submit' | 'cancel'
}>();
</script>

<template>
    <button 
        :type="variant === 'submit' ? 'submit' : 'button'" 
        :class="variant === 'submit' ? 'btn-submit' : 'btn-cancel'"
    >
        <slot />
    </button>
</template>