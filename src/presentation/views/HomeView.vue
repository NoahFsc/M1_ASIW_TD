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
import { Toast } from '@/services/ToastService';

const loading = ref(true);
const stats = ref<DashboardStats>({ totalParcours: 0, totalUes: 0, totalEtudiants: 0, moyenneGenerale: 0 });
const parcoursDistribution = ref<ParcoursDistribution>({ labels: [], data: [] });
const notesDistribution = ref<NotesDistribution>({ labels: [], data: [], colors: [] });
const topUes = ref<TopUes>({ labels: [], data: [] });

const hasNotes = computed(() => notesDistribution.value.data.reduce((sum, val) => sum + val, 0) > 0);

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
    <div class="page-container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Tableau de bord</h1>
                <p class="page-subtitle">Vue d'ensemble de votre université</p>
            </div>
        </div>

        <div v-if="loading" class="loading">Chargement du dashboard...</div>

        <div v-else class="dashboard-container">
            <div class="kpi-cards">
                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #eff6ff; color: #3b82f6;">
                        <i class="bi bi-signpost-2"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{{ stats.totalParcours }}</div>
                        <div class="kpi-label">Parcours</div>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #f0fdf4; color: #10b981;">
                        <i class="bi bi-book"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{{ stats.totalUes }}</div>
                        <div class="kpi-label">Unités d'Enseignement</div>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #fef3c7; color: #f59e0b;">
                        <i class="bi bi-people"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{{ stats.totalEtudiants }}</div>
                        <div class="kpi-label">Étudiants</div>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #fce7f3; color: #ec4899;">
                        <i class="bi bi-graph-up"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{{ stats.moyenneGenerale || 'N/A' }}</div>
                        <div class="kpi-label">Moyenne générale</div>
                    </div>
                </div>
            </div>

            <div class="charts-grid" v-if="hasNotes">
                <div class="chart-card">
                    <div class="chart-header">
                        <i class="bi bi-bar-chart"></i>
                        Répartition des étudiants par parcours
                    </div>
                    <div class="chart-body">
                        <BarChart 
                            :labels="parcoursDistribution.labels"
                            :data="parcoursDistribution.data"
                            title="Nombre d'étudiants"
                        />
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-header">
                        <i class="bi bi-pie-chart"></i>
                        Distribution des notes
                    </div>
                    <div class="chart-body">
                        <DoughnutChart 
                            :labels="notesDistribution.labels"
                            :data="notesDistribution.data"
                            :colors="notesDistribution.colors"
                            title="Répartition"
                        />
                    </div>
                </div>

                <div class="chart-card chart-card-wide">
                    <div class="chart-header">
                        <i class="bi bi-trophy"></i>
                        Top 5 des UEs les plus notées
                    </div>
                    <div class="chart-body">
                        <HorizontalBarChart 
                            :labels="topUes.labels"
                            :data="topUes.data"
                            title="Nombre d'étudiants notés"
                        />
                    </div>
                </div>
            </div>

            <div v-else class="empty-state">
                <i class="bi bi-clipboard-data"></i>
                <p>Aucune donnée statistique disponible pour le moment.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Commencez par ajouter des notes aux étudiants.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container { display: flex; flex-direction: column; gap: 2rem; }

.kpi-cards { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
    gap: 1.25rem; 
}

.kpi-card {
    background: white; 
    border: 1px solid var(--color-border); 
    border-radius: var(--radius-xl); 
    padding: 1.5rem; 
    display: flex; 
    align-items: center; 
    gap: 1.25rem;
    transition: var(--transition);
}
.kpi-card:hover { 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
    transform: translateY(-2px); 
}

.kpi-icon {
    width: 60px; 
    height: 60px; 
    border-radius: var(--radius-lg); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1.75rem;
    flex-shrink: 0;
}

.kpi-content { flex: 1; }
.kpi-value { 
    font-size: 2rem; 
    font-weight: 700; 
    color: var(--color-text-dark); 
    line-height: 1; 
}
.kpi-label { 
    font-size: 0.9rem; 
    color: var(--color-text-light); 
    margin-top: 0.5rem; 
}

.charts-grid {
    display: grid; 
    grid-template-columns: repeat(2, 1fr); 
    gap: 1.5rem;
}

.chart-card {
    background: white; 
    border: 1px solid var(--color-border); 
    border-radius: var(--radius-xl); 
    overflow: hidden;
}
.chart-card-wide { grid-column: 1 / -1; }

.chart-header {
    display: flex; 
    align-items: center; 
    gap: 0.75rem; 
    padding: 1.25rem; 
    background: var(--color-bg-light); 
    border-bottom: 1px solid var(--color-border); 
    font-weight: 600; 
    color: var(--color-text-dark);
}

.chart-body { padding: 1.5rem; }

@media (max-width: 768px) {
    .charts-grid { grid-template-columns: 1fr; }
    .chart-card-wide { grid-column: 1; }
}
</style>
