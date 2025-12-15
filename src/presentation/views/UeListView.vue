<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Toast } from '@/services/ToastService';
import UeForm from '@/presentation/components/forms/UeForm.vue';
import SearchBar from '@/presentation/components/common/SearchBar.vue';
import { Ue } from '@/domain/entities/Ue';
import { UeDAO } from '@/domain/daos/UeDAO';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const ueForm = ref<InstanceType<typeof UeForm> | null>(null);
const ues = ref<Ue[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());
const searchQuery = ref('');

const onDeleteUe = async (ue: Ue) => {
    const confirmed = await Toast.confirmDelete(
        'Supprimer cette UE ?',
        `Voulez-vous vraiment supprimer "${ue.Intitule}" ?`
    );
    
    if (confirmed) {
        try {
            await UeDAO.getInstance().delete(ue.ID!);
            ues.value = ues.value.filter((u) => u.ID !== ue.ID);
            Toast.success('UE supprimée avec succès');
        } catch (ex: any) {
            Toast.error(ex.message);
        }
    }
};

const columns = [
    { field: 'ID', label: 'Id', formatter: null, onClick: undefined, style: undefined },
    { field: 'NumeroUe', label: 'Numéro Ue', formatter: null, onClick: undefined, style: undefined },
    { field: 'Intitule', label: 'Intitulé', formatter: null, onClick: undefined, style: undefined },
    { field: 'Parcours', label: 'Parcours', formatter: null, onClick: undefined, style: undefined },
    { field: 'Actions', label: 'Actions', formatter: null, onClick: undefined, style: 'width: 100px; text-align: center;' },
];

const filteredUes = computed(() => {
    if (!searchQuery.value) return ues.value;
    const query = searchQuery.value.toLowerCase();
    return ues.value.filter(u => 
        u.NumeroUe?.toLowerCase().includes(query) ||
        u.Intitule?.toLowerCase().includes(query)
    );
});

const getParcoursList = (ue: Ue): string[] => {
    const parcoursData = ue.Parcours as any[] || [];
    if (parcoursData.length === 0) return [];
    
    if (typeof parcoursData[0] === 'number') {
        return parcoursData.map((id: number) => parcoursMap.value.get(id)?.NomParcours || `ID ${id}`);
    }
    return parcoursData.map((p: any) => p.NomParcours);
};

const getCellValue = (ue: Ue, field: string): string => {
    return (ue as any)[field] ?? '-';
};

const onUeCreated = (newUe: Ue) => { 
    ues.value.push(newUe); 
};

const onUeUpdated = (updatedUe: Ue) => { 
    const index = ues.value.findIndex(u => u.ID === updatedUe.ID); 
    if (index !== -1) { 
        ues.value.splice(index, 1, updatedUe); 
    }
};

onMounted(async () => {
    const parcoursList = await ParcoursDAO.getInstance().list();
    parcoursList.forEach(p => {
        if (p.ID) parcoursMap.value.set(p.ID, p);
    });
    
    const data = await UeDAO.getInstance().list();
    ues.value = data;
}); 
</script>

<template>
    <div class="page-container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Unités d'Enseignement</h1>
                <p class="page-subtitle">Gérez les UEs de formation</p>
            </div>
            <button class="btn-add" @click="() => ueForm?.openForm()">
                <i class="bi bi-plus-lg"></i>
                Nouvelle UE
            </button>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Rechercher une UE..." />

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
                    <tr v-if="filteredUes.length === 0">
                        <td :colspan="columns.length" class="empty-state">
                            <i class="bi bi-inbox"></i>
                            <p>Aucune UE trouvée</p>
                        </td>
                    </tr>
                    <tr v-for="ue in filteredUes" :key="ue.ID!">
                        <td v-for="col in columns" :key="col.field" :style="col.style">
                            <template v-if="col.field === 'Actions'">
                                <div class="actions">
                                    <button class="action-btn edit" @click="ueForm?.openForm(ue)">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="action-btn delete" @click="onDeleteUe(ue)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </template>
                            <template v-else-if="col.field === 'Parcours'">
                                <div class="parcours-pills">
                                    <span v-for="parcours in getParcoursList(ue)" :key="parcours" class="badge">
                                        {{ parcours }}
                                    </span>
                                    <span v-if="getParcoursList(ue).length === 0">-</span>
                                </div>
                            </template>
                            <template v-else>
                                {{ getCellValue(ue, col.field) }}
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UeForm ref="ueForm" @create:ue="onUeCreated" @update:ue="onUeUpdated" />
    </div>
</template>

<style scoped>
.parcours-pills { display: flex; flex-wrap: wrap; gap: 0.25rem; }
</style>
