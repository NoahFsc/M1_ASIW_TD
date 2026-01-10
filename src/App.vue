<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './presentation/components/navigation/Sidebar.vue'
</script>

<template>
  <main class="overflow-x-auto overflow-y-hidden">
    <div class="flex flex-nowrap w-full h-screen">
      <Sidebar />
      <RouterView class="h-screen grow overflow-y-auto" />
    </div>
  </main>
</template>
