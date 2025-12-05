<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Swal from 'sweetalert2';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const parcoursForm = ref<typeof ParcoursForm | null>(null);
const parcours = ref<Parcours[]>([]);
const searchQuery = ref('');

const filteredParcours = computed(() => {
    if (!searchQuery.value) return parcours.value;
    const query = searchQuery.value.toLowerCase();
    return parcours.value.filter(p => 
        p.NomParcours?.toLowerCase().includes(query) ||
        p.AnneeFormation?.toString().includes(query)
    );
});

const onParcoursCreated = (newParcours: Parcours) => { 
    parcours.value.unshift(newParcours); 
};

const onParcoursUpdated = (updatedParcours: Parcours) => { 
    const index = parcours.value.findIndex(p => p.ID === updatedParcours.ID); 
    if (index !== -1) { 
        parcours.value.splice(index, 1, updatedParcours); 
    }
};

const onDeleteParcours = (p: Parcours) => {
    Swal.fire({ 
        title: 'Supprimer ce parcours ?', 
        text: `Voulez-vous vraiment supprimer "${p.NomParcours}" ?`,
        icon: 'warning',
        showCancelButton: true, 
        confirmButtonText: 'Supprimer', 
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#dc3545',
    }).then((result) => { 
        if (result.isConfirmed) { 
            ParcoursDAO.getInstance().delete(p.ID!).then(() => { 
                parcours.value = parcours.value.filter((parcours) => parcours.ID !== p.ID); 
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

        <div class="search-container">
            <i class="bi bi-search search-icon"></i>
            <input 
                v-model="searchQuery"
                type="text" 
                class="search-input" 
                placeholder="Rechercher un parcours..."
            >
        </div>

        <div class="table-container">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Année</th>
                        <th>Intitulé</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filteredParcours.length === 0">
                        <td colspan="3" class="empty-state">
                            <i class="bi bi-inbox"></i>
                            <p>Aucun parcours trouvé</p>
                        </td>
                    </tr>
                    <tr v-for="p in filteredParcours" :key="p.ID!">
                        <td>
                            <span class="badge">
                                {{ p.AnneeFormation }}
                            </span>
                        </td>
                        <td class="name-col">{{ p.NomParcours }}</td>
                        <td class="actions-col">
                            <div class="actions">
                                <button class="action-btn edit" @click="parcoursForm?.openForm(p)" title="Modifier">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="action-btn delete" @click="onDeleteParcours(p)" title="Supprimer">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ParcoursForm ref="parcoursForm" @create:parcours="onParcoursCreated" @update:parcours="onParcoursUpdated" />
    </div>
</template>