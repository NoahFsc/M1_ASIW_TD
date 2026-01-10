<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Toast } from '@/services/ToastService';
import UeForm from '@/presentation/components/forms/UeForm.vue';
import SearchBar from '@/presentation/components/common/SearchBar.vue';
import ActionButtons, { type ActionButton } from '@/presentation/components/common/ActionButtons.vue';
import { Ue } from '@/domain/entities/Ue';
import { UeDAO } from '@/domain/daos/UeDAO';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const router = useRouter();
const ueForm = ref<InstanceType<typeof UeForm> | null>(null);
const ues = ref<Ue[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());
const searchQuery = ref('');

const goToUeDetail = (ue: Ue) => {
    router.push(`/ues/${ue.ID}`);
};

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
    { field: 'ID', label: 'Id' },
    { field: 'NumeroUe', label: 'Numéro Ue' },
    { field: 'Intitule', label: 'Intitulé' },
    { field: 'Parcours', label: 'Parcours' },
    { field: 'Actions', label: 'Actions', style: 'width: 100px; text-align: center;' },
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
    <div class="p-8 max-w-7xl mx-auto">
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Unités d'Enseignement</h1>
                <p class="text-gray-600 mt-1">Gérez les UEs de formation</p>
            </div>
            <button class="bg-primary hover:bg-primary-hover px-5 py-2.5 text-white rounded-lg font-medium flex items-center gap-2 cursor-pointer" @click="() => ueForm?.openForm()">
                <i class="fa-solid fa-plus"></i>
                Nouvelle UE
            </button>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Rechercher une UE..." />

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
                    <tr v-if="filteredUes.length === 0">
                        <td :colspan="columns.length" class="text-center py-12">
                            <i class="fa-solid fa-inbox text-4xl text-gray-300"></i>
                            <p class="text-gray-500 mt-2">Aucune UE trouvée</p>
                        </td>
                    </tr>
                    <tr v-for="ue in filteredUes" :key="ue.ID!" class="hover:bg-gray-50">
                        <td v-for="col in columns" :key="col.field" :style="col.style" class="px-4 py-3 text-sm text-gray-700">
                            <template v-if="col.field === 'Actions'">
                                <ActionButtons :actions="[
                                    { type: 'view', onClick: () => goToUeDetail(ue) },
                                    { type: 'delete', onClick: () => onDeleteUe(ue) }
                                ]" />
                            </template>
                            <template v-else-if="col.field === 'Parcours'">
                                <div class="flex flex-wrap gap-1">
                                    <span v-for="parcours in getParcoursList(ue)" :key="parcours" class="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
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

