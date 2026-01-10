<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Toast } from '@/services/ToastService';
import EtudiantForm from '@/presentation/components/forms/EtudiantForm.vue';
import SearchBar from '@/presentation/components/common/SearchBar.vue';
import ActionButtons, { type ActionButton } from '@/presentation/components/common/ActionButtons.vue';
import { Etudiant } from '@/domain/entities/Etudiant';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { getParcoursNom } from '@/domain/utils/parcoursHelper';

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

const getParcoursNomLocal = (etudiant: Etudiant): string => {
    return getParcoursNom(etudiant.ParcoursSuivi, parcoursMap.value);
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
    <div class="p-8 max-w-7xl mx-auto">
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Étudiants</h1>
                <p class="text-gray-600 mt-1">Gérez les étudiants inscrits</p>
            </div>
            <button class="bg-primary hover:bg-primary-hover px-5 py-2.5 text-white rounded-lg font-medium flex items-center gap-2 cursor-pointer" @click="() => etudiantForm?.openForm()">
                <i class="fa-solid fa-plus"></i>
                Nouvel étudiant
            </button>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Rechercher un étudiant..." />

        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th v-for="col in columns" :key="col.field" :style="col.style" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="filteredEtudiants.length === 0">
                        <td :colspan="columns.length" class="text-center py-12">
                            <i class="fa-solid fa-inbox text-4xl text-gray-300"></i>
                            <p class="text-gray-500 mt-2">Aucun étudiant trouvé</p>
                        </td>
                    </tr>
                    <tr v-for="etudiant in filteredEtudiants" :key="etudiant.ID!" class="hover:bg-gray-50">
                        <td v-for="col in columns" :key="col.field" :style="col.style" class="px-4 py-3 text-sm text-gray-700">
                            <template v-if="col.field === 'Actions'">
                                <ActionButtons :actions="[
                                    { type: 'edit', onClick: () => etudiantForm?.openForm(etudiant) },
                                    { type: 'delete', onClick: () => onDeleteEtudiant(etudiant) }
                                ]" />
                            </template>
                            <template v-else-if="col.field === 'ParcoursSuivi'">
                                <span class="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{{ getParcoursNomLocal(etudiant) }}</span>
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
