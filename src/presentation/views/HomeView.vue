<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { UeDAO } from '@/domain/daos/UeDAO';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { NoteDAO } from '@/domain/daos/NoteDAO';
import { 
    calculateDashboardStats, 
    calculateParcoursDistribution, 
    calculateNotesDistribution,
    calculateTopUes,
    type DashboardStats,
    type ParcoursDistribution,
    type NotesDistribution,
    type TopUes
} from '@/domain/utils/statsHelper';
import BarChart from '@/presentation/components/charts/BarChart.vue';
import DoughnutChart from '@/presentation/components/charts/DoughnutChart.vue';
import HorizontalBarChart from '@/presentation/components/charts/HorizontalBarChart.vue';
import StatCard from '@/presentation/components/common/StatCard.vue';
import { Toast } from '@/services/ToastService';

const loading = ref(true);
const stats = ref<DashboardStats>({ totalParcours: 0, totalUes: 0, totalEtudiants: 0, moyenneGenerale: 0 });
const parcoursDistribution = ref<ParcoursDistribution>({ labels: [], data: [] });
const notesDistribution = ref<NotesDistribution>({ labels: [], data: [], colors: [] });
const topUes = ref<TopUes>({ labels: [], data: [] });

const hasNotes = computed(() => notesDistribution.value.data.reduce((sum, val) => sum + val, 0) > 0);

/**
 * Charge toutes les données nécessaires au tableau de bord
 */
onMounted(async () => {
    try {
        const [parcours, ues, etudiants, notes] = await Promise.all([
            ParcoursDAO.getInstance().list(),
            UeDAO.getInstance().list(),
            EtudiantDAO.getInstance().list(),
            NoteDAO.getInstance().list()
        ]);

        stats.value = calculateDashboardStats(parcours, ues, etudiants, notes);
        parcoursDistribution.value = calculateParcoursDistribution(parcours, etudiants);
        notesDistribution.value = calculateNotesDistribution(notes);
        topUes.value = calculateTopUes(ues, notes);
    } catch (ex: any) {
        Toast.error(ex.message);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="p-8 max-w-7xl mx-auto">
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p class="text-gray-600 mt-1">Vue d'ensemble de votre université</p>
            </div>
        </div>

        <div v-if="loading" class="text-center py-12 text-gray-500">Chargement du dashboard...</div>

        <div v-else class="flex flex-col gap-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    icon="fa-signs-post"
                    icon-color="text-blue-500"
                    icon-bg-color="bg-blue-50"
                    :value="stats.totalParcours"
                    label="Parcours"
                />

                <StatCard 
                    icon="fa-book"
                    icon-color="text-green-500"
                    icon-bg-color="bg-green-50"
                    :value="stats.totalUes"
                    label="Unités d'Enseignement"
                />

                <StatCard 
                    icon="fa-users"
                    icon-color="text-amber-500"
                    icon-bg-color="bg-amber-50"
                    :value="stats.totalEtudiants"
                    label="Étudiants"
                />

                <StatCard 
                    icon="fa-chart-line"
                    icon-color="text-pink-500"
                    icon-bg-color="bg-pink-50"
                    :value="stats.moyenneGenerale || 'N/A'"
                    label="Moyenne générale"
                />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" v-if="hasNotes">
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                        <i class="fa-solid fa-chart-column"></i>
                        Répartition des étudiants par parcours
                    </div>
                    <div class="p-6">
                        <BarChart 
                            :labels="parcoursDistribution.labels"
                            :data="parcoursDistribution.data"
                            title="Nombre d'étudiants"
                        />
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                        <i class="fa-solid fa-chart-pie"></i>
                        Distribution des notes
                    </div>
                    <div class="p-6">
                        <DoughnutChart 
                            :labels="notesDistribution.labels"
                            :data="notesDistribution.data"
                            :colors="notesDistribution.colors"
                            title="Répartition"
                        />
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden lg:col-span-2">
                    <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                        <i class="fa-solid fa-trophy"></i>
                        Top 5 des UEs les plus notées
                    </div>
                    <div class="p-6">
                        <HorizontalBarChart 
                            :labels="topUes.labels"
                            :data="topUes.data"
                            title="Nombre d'étudiants notés"
                        />
                    </div>
                </div>
            </div>

            <div v-else class="empty-state">
                <i class="fa-solid fa-clipboard"></i>
                <p>Aucune donnée statistique disponible pour le moment.</p>
                <p class="text-sm mt-2">Commencez par ajouter des notes aux étudiants.</p>
            </div>
        </div>
    </div>
</template>
