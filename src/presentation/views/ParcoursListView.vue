<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Toast } from '@/services/ToastService';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import SearchBar from '@/presentation/components/common/SearchBar.vue';
import ActionButtons, { type ActionButton } from '@/presentation/components/common/ActionButtons.vue';
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
    { field: 'ID', label: 'Id' },
    { field: 'NomParcours', label: 'Nom du Parcours' },
    { field: 'AnneeFormation', label: 'Année de formation' },
    { field: 'Actions', label: 'Actions', style: 'width: 100px; text-align: center;' },
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
    <div class="p-8 max-w-7xl mx-auto">
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Parcours</h1>
                <p class="text-gray-600 mt-1">Gérez les parcours de formation</p>
            </div>
            <button class="bg-primary hover:bg-primary-hover px-5 py-2.5 text-white rounded-lg font-medium flex items-center gap-2 cursor-pointer" @click="() => parcoursForm?.openForm()">
                <i class="fa-solid fa-plus"></i>
                Nouveau parcours
            </button>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Rechercher un parcours..." />

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
                    <tr v-if="filteredParcours.length === 0">
                        <td :colspan="columns.length" class="text-center py-12">
                            <i class="fa-solid fa-inbox text-4xl text-gray-300"></i>
                            <p class="text-gray-500 mt-2">Aucun parcours trouvé</p>
                        </td>
                    </tr>
                    <tr v-for="p in filteredParcours" :key="p.ID!" class="hover:bg-gray-50">
                        <td v-for="col in columns" :key="col.field" :style="col.style" class="px-4 py-3 text-sm text-gray-700">
                            <template v-if="col.field === 'Actions'">
                                <ActionButtons :actions="[
                                    { type: 'edit', onClick: () => parcoursForm?.openForm(p) },
                                    { type: 'delete', onClick: () => onDeleteParcours(p) }
                                ]" />
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