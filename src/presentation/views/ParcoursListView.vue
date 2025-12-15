<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Toast } from '@/services/ToastService';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import SearchBar from '@/presentation/components/common/SearchBar.vue';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const parcoursForm = ref<InstanceType<typeof ParcoursForm> | null>(null);
const parcours = ref<Parcours[]>([]);
const searchQuery = ref('');

const onDeleteParcours = async (p: Parcours) => {
    const confirmed = await Toast.confirmDelete(
        'Supprimer ce parcours ?',
        `Voulez-vous vraiment supprimer "${p.NomParcours}" ?`
    );
    
    if (confirmed) {
        try {
            await ParcoursDAO.getInstance().delete(p.ID!);
            parcours.value = parcours.value.filter((parcours) => parcours.ID !== p.ID);
            Toast.success('Parcours supprimé avec succès');
        } catch (ex: any) {
            Toast.error(ex.message);
        }
    }
};

const columns = [
    { field: 'ID', label: 'Id', formatter: null, onClick: undefined, style: undefined },
    { field: 'NomParcours', label: 'Nom du Parcours', formatter: null, onClick: undefined, style: undefined },
    { field: 'AnneeFormation', label: 'Année de formation', formatter: null, onClick: undefined, style: undefined },
    { field: 'Actions', label: 'Actions', formatter: null, onClick: undefined, style: 'width: 100px; text-align: center;' },
];

const filteredParcours = computed(() => {
    if (!searchQuery.value) return parcours.value;
    const query = searchQuery.value.toLowerCase();
    return parcours.value.filter(p => 
        p.NomParcours?.toLowerCase().includes(query) ||
        p.AnneeFormation?.toString().includes(query)
    );
});

const getCellValue = (p: Parcours, field: string): string => {
    return (p as any)[field] ?? '-';
};

const onParcoursCreated = (newParcours: Parcours) => { 
    parcours.value.push(newParcours); 
};

const onParcoursUpdated = (updatedParcours: Parcours) => { 
    const index = parcours.value.findIndex(p => p.ID === updatedParcours.ID); 
    if (index !== -1) { 
        parcours.value.splice(index, 1, updatedParcours); 
    }
};

onMounted(() => {
    ParcoursDAO.getInstance().list().then((data) => {
        parcours.value = data;
    });
}); 
</script>

<template>
    <div class="page-container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Parcours</h1>
                <p class="page-subtitle">Gérez les parcours de formation</p>
            </div>
            <button class="btn-add" @click="() => parcoursForm?.openForm()">
                <i class="bi bi-plus-lg"></i>
                Nouveau parcours
            </button>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Rechercher un parcours..." />

        <div class="table-container">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th v-for="col in columns" :key="col.field" :style="col.style">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filteredParcours.length === 0">
                        <td :colspan="columns.length" class="empty-state">
                            <i class="bi bi-inbox"></i>
                            <p>Aucun parcours trouvé</p>
                        </td>
                    </tr>
                    <tr v-for="p in filteredParcours" :key="p.ID!">
                        <td v-for="col in columns" :key="col.field" :style="col.style">
                            <template v-if="col.field === 'Actions'">
                                <div class="actions">
                                    <button class="action-btn edit" @click="parcoursForm?.openForm(p)">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="action-btn delete" @click="onDeleteParcours(p)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </template>
                            <template v-else>
                                {{ getCellValue(p, col.field) }}
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ParcoursForm ref="parcoursForm" @create:parcours="onParcoursCreated" @update:parcours="onParcoursUpdated" />
    </div>
</template>