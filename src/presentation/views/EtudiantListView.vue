<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Toast } from '@/services/ToastService';
import EtudiantForm from '@/presentation/components/forms/EtudiantForm.vue';
import SearchBar from '@/presentation/components/common/SearchBar.vue';
import { Etudiant } from '@/domain/entities/Etudiant';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const etudiantForm = ref<InstanceType<typeof EtudiantForm> | null>(null);
const etudiants = ref<Etudiant[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());
const searchQuery = ref('');

const onDeleteEtudiant = async (etudiant: Etudiant) => {
    const confirmed = await Toast.confirmDelete(
        'Supprimer cet étudiant ?',
        `Voulez-vous vraiment supprimer "${etudiant.Prenom} ${etudiant.Nom}" ?`
    );
    
    if (confirmed) {
        try {
            await EtudiantDAO.getInstance().delete(etudiant.ID!);
            etudiants.value = etudiants.value.filter((e) => e.ID !== etudiant.ID);
            Toast.success('Étudiant supprimé avec succès');
        } catch (ex: any) {
            Toast.error(ex.message);
        }
    }
};

const columns = [
    { field: 'ID', label: 'Id', style: 'width: 60px;' },
    { field: 'NumEtud', label: 'N° Étudiant' },
    { field: 'Nom', label: 'Nom' },
    { field: 'Prenom', label: 'Prénom' },
    { field: 'Email', label: 'Email' },
    { field: 'ParcoursSuivi', label: 'Parcours' },
    { field: 'Actions', label: 'Actions', style: 'width: 100px; text-align: center;' },
];

const filteredEtudiants = computed(() => {
    if (!searchQuery.value) return etudiants.value;
    const query = searchQuery.value.toLowerCase();
    return etudiants.value.filter(e => 
        e.NumEtud?.toLowerCase().includes(query) ||
        e.Nom?.toLowerCase().includes(query) ||
        e.Prenom?.toLowerCase().includes(query) ||
        e.Email?.toLowerCase().includes(query)
    );
});

const getParcoursNom = (etudiant: Etudiant): string => {
    const parcours = etudiant.ParcoursSuivi as any;
    if (!parcours) return '-';
    
    if (typeof parcours === 'number') {
        return parcoursMap.value.get(parcours)?.NomParcours || `ID ${parcours}`;
    }
    return parcours.NomParcours || '-';
};

const getCellValue = (etudiant: Etudiant, field: string): string => {
    return (etudiant as any)[field] ?? '-';
};

const onEtudiantCreated = (newEtudiant: Etudiant) => { 
    etudiants.value.push(newEtudiant); 
};

const onEtudiantUpdated = (updatedEtudiant: Etudiant) => { 
    const index = etudiants.value.findIndex(e => e.ID === updatedEtudiant.ID); 
    if (index !== -1) { 
        etudiants.value.splice(index, 1, updatedEtudiant); 
    }
};

onMounted(async () => {
    const parcoursList = await ParcoursDAO.getInstance().list();
    parcoursList.forEach(p => {
        if (p.ID) parcoursMap.value.set(p.ID, p);
    });
    
    const data = await EtudiantDAO.getInstance().list();
    etudiants.value = data;
}); 
</script>

<template>
    <div class="page-container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Étudiants</h1>
                <p class="page-subtitle">Gérez les étudiants inscrits</p>
            </div>
            <button class="btn-add" @click="() => etudiantForm?.openForm()">
                <i class="bi bi-plus-lg"></i>
                Nouvel étudiant
            </button>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Rechercher un étudiant..." />

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
                    <tr v-if="filteredEtudiants.length === 0">
                        <td :colspan="columns.length" class="empty-state">
                            <i class="bi bi-inbox"></i>
                            <p>Aucun étudiant trouvé</p>
                        </td>
                    </tr>
                    <tr v-for="etudiant in filteredEtudiants" :key="etudiant.ID!">
                        <td v-for="col in columns" :key="col.field" :style="col.style">
                            <template v-if="col.field === 'Actions'">
                                <div class="actions">
                                    <button class="action-btn edit" @click="etudiantForm?.openForm(etudiant)">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="action-btn delete" @click="onDeleteEtudiant(etudiant)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </template>
                            <template v-else-if="col.field === 'ParcoursSuivi'">
                                <span class="badge">{{ getParcoursNom(etudiant) }}</span>
                            </template>
                            <template v-else>
                                {{ getCellValue(etudiant, col.field) }}
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <EtudiantForm ref="etudiantForm" @create:etudiant="onEtudiantCreated" @update:etudiant="onEtudiantUpdated" />
    </div>
</template>
