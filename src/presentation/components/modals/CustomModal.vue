<script setup lang="ts">

import { defineProps } from 'vue';

defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    width: {
        type: String,
        required: false,
        default: null,
    },
});
</script>

<template>
    <div v-if="isOpen" class="custom-modal">
        <div class="card new-parcours" :style="{ 'width': width ?? 'auto' }">
            <div class="card-header" style="background: #273656">
                <slot name="title"></slot>
            </div>
            <div class="card-body">
                <slot name="body"></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-modal .card {
    min-width: 300px;
}
</style>