<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Swal from 'sweetalert2';
import UeForm from '@/presentation/components/forms/UeForm.vue';
import { Ue } from '@/domain/entities/Ue';
import { UeDAO } from '@/domain/daos/UeDAO';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const ueForm = ref<typeof UeForm | null>(null);
const ues = ref<Ue[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());
const searchQuery = ref('');

const filteredUes = computed(() => {
    if (!searchQuery.value) return ues.value;
    const query = searchQuery.value.toLowerCase();
    return ues.value.filter(u => 
        u.NumeroUe?.toLowerCase().includes(query) ||
        u.Intitule?.toLowerCase().includes(query) ||
        getParcoursNames(u).toLowerCase().includes(query)
    );
});

const getParcoursNames = (ue: Ue) => {
    const parcoursData = ue.Parcours as any[] || [];
    if (parcoursData.length === 0) return '-';
    
    if (typeof parcoursData[0] === 'number') {
        return parcoursData
            .map((id: number) => parcoursMap.value.get(id)?.NomParcours || `ID ${id}`)
            .join(', ');
    }
    return parcoursData.map((p: any) => p.NomParcours).join(', ');
};

const onUeCreated = (newUe: Ue) => { 
    ues.value.unshift(newUe); 
};

const onUeUpdated = (updatedUe: Ue) => { 
    const index = ues.value.findIndex(u => u.ID === updatedUe.ID); 
    if (index !== -1) { 
        ues.value.splice(index, 1, updatedUe); 
    }
};

const onDeleteUe = (ue: Ue) => {
    Swal.fire({ 
        title: 'Supprimer cette UE ?', 
        text: `Voulez-vous vraiment supprimer "${ue.Intitule}" ?`,
        icon: 'warning',
        showCancelButton: true, 
        confirmButtonText: 'Supprimer', 
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#dc3545',
    }).then((result) => { 
        if (result.isConfirmed) { 
            UeDAO.getInstance().delete(ue.ID!).then(() => { 
                ues.value = ues.value.filter((u) => u.ID !== ue.ID); 
            }).catch((ex) => { 
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: ex.message,
                });
            }); 
        } 
    }); 
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

        <div class="search-container">
            <i class="bi bi-search search-icon"></i>
            <input 
                v-model="searchQuery"
                type="text" 
                class="search-input" 
                placeholder="Rechercher une UE..."
            >
        </div>

        <div class="table-container">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Numéro</th>
                        <th>Intitulé</th>
                        <th>Parcours</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filteredUes.length === 0">
                        <td colspan="4" class="empty-state">
                            <i class="bi bi-inbox"></i>
                            <p>Aucune UE trouvée</p>
                        </td>
                    </tr>
                    <tr v-for="ue in filteredUes" :key="ue.ID!">
                        <td>
                            <span class="badge badge-ue">{{ ue.NumeroUe }}</span>
                        </td>
                        <td class="name-col">{{ ue.Intitule }}</td>
                        <td class="parcours-col">{{ getParcoursNames(ue) }}</td>
                        <td class="actions-col">
                            <div class="actions">
                                <button class="action-btn edit" @click="ueForm?.openForm(ue)" title="Modifier">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="action-btn delete" @click="onDeleteUe(ue)" title="Supprimer">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UeForm ref="ueForm" @create:ue="onUeCreated" @update:ue="onUeUpdated" />
    </div>
</template>

<style scoped>
.parcours-col {
    color: #6b7280;
    font-size: 0.9rem;
}
</style>
