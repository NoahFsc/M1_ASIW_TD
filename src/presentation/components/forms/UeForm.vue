<script setup lang="ts"> 
import { ref, onBeforeMount, watch, toRaw } from 'vue'; 
import { Toast } from '@/services/ToastService';
import { Ue } from '@/domain/entities/Ue';
import { Parcours } from '@/domain/entities/Parcours'; 
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { UeDAO } from '@/domain/daos/UeDAO'; 
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO'; 
import { parseParcours } from '@/domain/utils/parcoursHelper';
import { validateMinLength } from '@/domain/utils/validators';

const emit = defineEmits(['create:ue', 'update:ue']); 
 
const currentUe = ref<Ue>(new Ue(null, null, null, null)); 
const isOpen = ref(false); 
const formErrors = ref<{ 
    NumeroUe: string | null; 
    Intitule: string | null; 
    parcours: string | null; 
}>({ 
    NumeroUe: null, 
    Intitule: null, 
    parcours: null, 
}); 
 
const parcoursOptions = ref<Parcours[]>([]); 

const openForm = (ue: Ue | null = null) => { 
    isOpen.value = true; 
    if (ue) { 
        currentUe.value = new Ue(
            ue.ID,
            ue.NumeroUe,
            ue.Intitule,
            (ue.Parcours || []).map(p => parseParcours(p, parcoursOptions.value))
        );
    } 
}; 
 
const closeForm = () => { 
    isOpen.value = false; 
    currentUe.value = new Ue(null, null, null, null);
    formErrors.value = { NumeroUe: null, Intitule: null, parcours: null };
}; 
 
const saveUe = async () => { 
    if (formErrors.value.Intitule || formErrors.value.NumeroUe) return;
 
    try {
        if (currentUe.value.ID) { 
            await UeDAO.getInstance().update(currentUe.value.ID, currentUe.value);
            Toast.success('UE mise à jour avec succès'); 
            emit('update:ue', JSON.parse(JSON.stringify(toRaw(currentUe.value)))); 
        } else { 
            const newUe = await UeDAO.getInstance().create(currentUe.value);
            Toast.success('UE créée avec succès'); 
            emit('create:ue', newUe); 
        } 
        closeForm(); 
    } catch (ex: any) {
        Toast.error(ex.message); 
    }
}; 
 
onBeforeMount(async () => { 
    parcoursOptions.value = await ParcoursDAO.getInstance().list();
}); 
 
defineExpose({ 
    openForm, 
    closeForm, 
}); 
 
watch(() => currentUe.value.Intitule, () => { 
    formErrors.value.Intitule = validateMinLength(currentUe.value.Intitule, 3, 'L\'intitulé');
}); 
 
watch(() => currentUe.value.NumeroUe, () => { 
    formErrors.value.NumeroUe = validateMinLength(currentUe.value.NumeroUe, 3, 'Le numéro d\'UE');
}); 
</script> 
 
<template> 
    <CustomModal :isOpen="isOpen">
        <template #title>
            {{ currentUe.ID ? 'Modifier l\'UE' : 'Nouvelle UE' }}
        </template>

        <template #body>
            <form class="form-modern" @submit.prevent="saveUe">
                <CustomInput 
                    v-model="currentUe.NumeroUe"
                    id="numeroue"
                    libelle="Numéro d'UE"
                    type="text"
                    placeholder="Ex: UE301"
                    :error="formErrors.NumeroUe"
                />

                <CustomInput 
                    v-model="currentUe.Intitule"
                    id="intitule"
                    libelle="Intitulé"
                    type="text"
                    placeholder="Ex: Développement Web"
                    :error="formErrors.Intitule"
                />

                <div class="form-group">
                    <label class="form-label" for="parcours">Parcours</label>
                    <v-select 
                        id="parcours"
                        multiple 
                        label="NomParcours"
                        v-model="currentUe.Parcours" 
                        :options="parcoursOptions"
                        :getOptionKey="(p: any) => p.ID || p.id"
                        class="form-select-modern"
                        placeholder="Sélectionner les parcours..."
                    ></v-select>
                    <span v-if="formErrors.parcours" class="form-error">{{ formErrors.parcours }}</span>
                </div>

                <div class="form-actions">
                    <CustomButton variant="cancel" @click="closeForm">Annuler</CustomButton>
                    <CustomButton variant="submit">{{ currentUe.ID ? 'Modifier' : 'Créer' }}</CustomButton>
                </div>
            </form>
        </template>
    </CustomModal> 
</template>