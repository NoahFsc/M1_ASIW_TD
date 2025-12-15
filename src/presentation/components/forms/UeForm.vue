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

const parseParcours = (p: any): Parcours => {
    if (typeof p === 'number') {
        return parcoursOptions.value.find(opt => opt.ID === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
};

const openForm = (ue: Ue | null = null) => { 
    isOpen.value = true; 
    if (ue) { 
        currentUe.value = new Ue(
            ue.ID,
            ue.NumeroUe,
            ue.Intitule,
            (ue.Parcours || []).map(parseParcours)
        );
    } 
}; 
 
const closeForm = () => { 
    isOpen.value = false; 
    currentUe.value = new Ue(null, null, null, null);
    formErrors.value = { NumeroUe: null, Intitule: null, parcours: null };
}; 
 
const saveUe = () => { 
    if (formErrors.value.Intitule || formErrors.value.NumeroUe) { 
        return; 
    } 

    console.log('UE sauvegardée :', currentUe.value);
 
    if (currentUe.value.ID) { 
        UeDAO.getInstance().update(currentUe.value.ID, currentUe.value).then(() => { 
            Toast.success('UE mise à jour avec succès'); 
            emit('update:ue', JSON.parse(JSON.stringify(toRaw(currentUe.value)))); 
            closeForm(); 
        }).catch((ex) => { 
            Toast.error(ex.message); 
        }); 
    } else { 
        UeDAO.getInstance().create(currentUe.value).then((newUe) => { 
            Toast.success('UE créée avec succès'); 
            emit('create:ue', newUe); 
            closeForm(); 
        }).catch((ex) => { 
            Toast.error(ex.message); 
        }); 
    } 
}; 
 
const emit = defineEmits(['create:ue', 'update:ue']); 
 
onBeforeMount(() => { 
    ParcoursDAO.getInstance().list().then((parcours) => { 
        parcoursOptions.value = parcours 
    }); 
}); 
 
defineExpose({ 
    openForm, 
    closeForm, 
}); 
 
watch(() => currentUe.value.Intitule, () => { 
    if (!currentUe.value.Intitule || currentUe.value.Intitule.trim() === '' || currentUe.value.Intitule.length < 3) { 
        formErrors.value.Intitule = 'L\'intitulé doit faire au moins 3 caractères'; 
    } else { 
        formErrors.value.Intitule = null; 
    } 
}); 
 
watch(() => currentUe.value.NumeroUe, () => { 
    if (!currentUe.value.NumeroUe || currentUe.value.NumeroUe.trim() === '' || currentUe.value.NumeroUe.length < 3) { 
        formErrors.value.NumeroUe = 'Le numéro d\'ue doit faire au moins 3 caractères'; 
    } else { 
        formErrors.value.NumeroUe = null; 
    } 
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