<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './presentation/components/navigation/Sidebar.vue'
</script>

<template>
  <main>
    <div class="application d-flex flex-nowrap">
      <Sidebar />
      <RouterView class="content" />
    </div>
  </main>
</template>

<style scoped>
main {
  overflow-x: auto;
  overflow-y: hidden;
}

main .application {
  width: 100%;
  height: 100vh;
}

.content {
  height: 100vh;
  flex-grow: 1;
}
</style>
