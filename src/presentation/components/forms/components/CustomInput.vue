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
  <div class="form-group"> 
    <label class="form-label" :for="id">{{ libelle }}</label> 
    <input 
      v-model="model" 
      class="form-input" 
      :class="{ 'error': error }" 
      :type="type" 
      :id="id" 
      :placeholder="placeholder" 
    /> 
    <span v-if="error" class="form-error">{{ error }}</span> 
  </div> 
</template>