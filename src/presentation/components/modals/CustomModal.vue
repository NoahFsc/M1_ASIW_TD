<script setup lang="ts">

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

defineEmits(['close']);
</script>

<!-- Template pour la fenêtre modale générique de création/modification -->
<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
            <div class="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" :style="{ width: width ?? '420px' }">
                <div class="px-6 pt-6">
                    <h3 class="m-0 text-xl font-semibold text-gray-900">
                        <slot name="title"></slot>
                    </h3>
                </div>
                <div class="p-6 overflow-y-auto">
                    <slot name="body"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>