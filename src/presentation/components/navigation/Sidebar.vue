<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isCollapsed = ref(false)

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
}

const menuItems = [
    { to: '/', icon: 'bi-house-door', label: 'Accueil' },
    { to: '/parcours', icon: 'bi-signpost-2', label: 'Parcours' },
    { to: '/ues', icon: 'bi-book', label: 'UEs' },
    { to: '/etudiants', icon: 'bi-people', label: 'Étudiants' },
]
</script>

<template>
    <aside class="sidebar d-flex flex-column flex-shrink-0" :class="{ collapsed: isCollapsed }">
        <div class="sidebar-header d-flex align-items-center">
            <i class="bi bi-mortarboard-fill sidebar-logo"></i>
            <span v-show="!isCollapsed" class="sidebar-title">Université</span>
        </div>

        <hr class="sidebar-divider">

        <nav class="sidebar-nav flex-grow-1">
            <ul class="nav flex-column">
                <li v-for="item in menuItems" :key="item.to" class="nav-item">
                    <RouterLink 
                        class="nav-link d-flex align-items-center" 
                        active-class="active" 
                        :to="item.to"
                        :title="isCollapsed ? item.label : ''"
                    >
                        <i class="bi" :class="item.icon"></i>
                        <span v-show="!isCollapsed" class="nav-label">{{ item.label }}</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>

        <hr class="sidebar-divider">

        <button class="toggle-btn d-flex align-items-center" @click="toggleSidebar">
            <i class="bi" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
            <span v-show="!isCollapsed" class="toggle-label">Réduire</span>
        </button>
    </aside>
</template>

<style scoped>
/* Sidebar Container */
.sidebar { background-color: var(--color-primary, #273656); color: white; width: 250px; min-height: 100vh; padding: 1rem; transition: width 0.3s ease; }
.sidebar.collapsed { width: 70px; }

/* Header */
.sidebar-header { gap: 0.75rem; padding: 0.5rem 0; }
.sidebar.collapsed .sidebar-header { justify-content: center; }
.sidebar-logo { font-size: 1.5rem; flex-shrink: 0; }
.sidebar-title { font-size: 1.25rem; font-weight: 600; white-space: nowrap; overflow: hidden; }
.sidebar-divider { border-color: rgba(255, 255, 255, 0.2); margin: 0.75rem 0; }

/* Navigation */
.sidebar-nav .nav { gap: 0.5rem; }
.sidebar-nav .nav-link { color: rgba(255, 255, 255, 0.8); padding: 0.75rem; border-radius: 8px; gap: 0.75rem; transition: all 0.2s; text-decoration: none; }
.sidebar-nav .nav-link:hover { background-color: rgba(255, 255, 255, 0.1); color: white; }
.sidebar-nav .nav-link.active { background-color: rgba(255, 255, 255, 0.2); color: white; }
.sidebar-nav .nav-link i { font-size: 1.1rem; flex-shrink: 0; width: 24px; text-align: center; }
.nav-label { white-space: nowrap; overflow: hidden; }
.sidebar.collapsed .nav-link { justify-content: center; padding: 0.75rem 0.5rem; }

/* Toggle Button */
.toggle-btn { background: transparent; border: none; color: rgba(255, 255, 255, 0.8); cursor: pointer; padding: 0.75rem; border-radius: 8px; transition: all 0.2s; gap: 0.75rem; }
.toggle-btn:hover { background-color: rgba(255, 255, 255, 0.1); color: white; }
.toggle-btn i { font-size: 1.1rem; flex-shrink: 0; width: 24px; text-align: center; }
.toggle-label { white-space: nowrap; overflow: hidden; }
.sidebar.collapsed .toggle-btn { justify-content: center; }
</style>
