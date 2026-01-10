<script setup lang="ts">
const model = defineModel();

const props = defineProps<{ 
  id: string, 
  libelle: string, 
  type: string, 
  placeholder: string | undefined, 
  error: string | undefined | null, 
}>(); 
</script>

<template> 
  <div class="flex flex-col gap-2"> 
    <label class="font-medium text-gray-600 text-sm" :for="id">{{ libelle }}</label> 
    <input 
      v-model="model" 
      class="px-4 h-10 border-2 border-gray-200 rounded-lg text-sm transition-all outline-none hover:border-gray-300 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" 
      :class="{ 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]': error }" 
      :type="type" 
      :id="id" 
      :placeholder="placeholder" 
    /> 
    <span v-if="error" class="text-red-500 text-xs">{{ error }}</span> 
  </div> 
</template>