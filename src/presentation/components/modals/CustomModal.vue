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
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
                <div class="modal-container" :style="{ width: width ?? '420px' }">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <slot name="title"></slot>
                        </h3>
                    </div>
                    <div class="modal-body">
                        <slot name="body"></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* Overlay */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; }

/* Container */
.modal-container { background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 1.5rem 1.5rem 0; }
.modal-title { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1a1a2e; }
.modal-body { padding: 1.5rem; overflow-y: auto; }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-container, .modal-leave-to .modal-container { transform: scale(0.95) translateY(-10px); }
</style>