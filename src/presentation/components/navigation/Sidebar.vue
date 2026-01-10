<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isCollapsed = ref(false)

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
}

const menuItems = [
    { to: '/', icon: 'fa-house', label: 'Accueil' },
    { to: '/parcours', icon: 'fa-signs-post', label: 'Parcours' },
    { to: '/ues', icon: 'fa-book', label: 'UEs' },
    { to: '/etudiants', icon: 'fa-users', label: 'Étudiants' },
]
</script>

<template>
    <aside class="bg-primary text-white min-h-screen p-4 flex flex-col shrink-0" :class="isCollapsed ? 'w-18' : 'w-64'">
        <div class="flex items-center gap-3 py-2" :class="isCollapsed ? 'justify-center' : ''">
            <i class="fa-solid fa-graduation-cap text-2xl shrink-0"></i>
            <span v-show="!isCollapsed" class="text-xl font-semibold whitespace-nowrap overflow-hidden">Université</span>
        </div>

        <hr class="border-white/20 my-3">

        <nav class="grow">
            <ul class="flex flex-col gap-2">
                <li v-for="item in menuItems" :key="item.to">
                    <RouterLink 
                        class="flex items-center gap-3 p-3 rounded-lg text-white/80 no-underline hover:bg-white/10 hover:text-white" 
                        active-class="!bg-white/20 !text-white" 
                        :to="item.to"
                        :title="isCollapsed ? item.label : ''"
                        :class="isCollapsed ? 'justify-center px-2' : ''"
                    >
                        <i class="fa-solid text-lg shrink-0 w-6 text-center" :class="item.icon"></i>
                        <span v-show="!isCollapsed" class="whitespace-nowrap overflow-hidden">{{ item.label }}</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>

        <hr class="border-white/20 my-3">

        <button class="flex items-center gap-3 p-3 rounded-lg bg-transparent border-none text-white/80 cursor-pointer hover:bg-white/10 hover:text-white" @click="toggleSidebar" :class="isCollapsed ? 'justify-center' : ''">
            <i class="fa-solid text-lg shrink-0 w-6 text-center" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
            <span v-show="!isCollapsed" class="whitespace-nowrap overflow-hidden">Réduire</span>
        </button>
    </aside>
</template>
