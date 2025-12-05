<script setup lang="ts"> 
import { ref, onBeforeMount, defineExpose, defineProps, watch, toRaw } from 'vue'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum'; 
import { Ue } from '@/domain/entities/Ue';
import { Parcours } from '@/domain/entities/Parcours'; 
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue'; 
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue'; 
import CustomModal from '@/presentation/components/modals/CustomModal.vue'; 
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
 
const openForm = (ue: Ue | null = null) => { 
    isOpen.value = true; 
    if (ue) { 
        const parcoursData = ue.Parcours || [];
        
        // Transformer les IDs en objets Parcours complets pour v-select
        const parcoursList = parcoursData.map((p: any) => {
            // Si c'est un ID (nombre), chercher l'objet complet dans parcoursOptions
            if (typeof p === 'number') {
                const found = parcoursOptions.value.find(opt => opt.ID === p);
                return found || new Parcours(p, `Parcours ${p}`, null);
            }
            // Si c'est déjà un objet
            return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
        });
        
        currentUe.value = new Ue(
            ue.ID,
            ue.NumeroUe,
            ue.Intitule,
            parcoursList
        );
    } 
}; 
 
const closeForm = () => { 
    isOpen.value = false; 
    currentUe.value = new Ue(null, null, null, null); 
}; 
 
const saveUe = () => { 
    if (formErrors.value.Intitule || formErrors.value.NumeroUe) { 
        return; 
    } 
 
    if (currentUe.value.ID) { 
        UeDAO.getInstance().update(currentUe.value.ID, currentUe.value).then(() => { 
            alert('UE mise à jour avec succès'); 
            emit('update:ue', JSON.parse(JSON.stringify(toRaw(currentUe.value)))); 
            closeForm(); 
        }).catch((ex) => { 
            alert(ex.message); 
        }); 
    } else { 
        UeDAO.getInstance().create(currentUe.value).then((newUe) => { 
            alert('UE créée avec succès'); 
            emit('create:ue', newUe); 
            closeForm(); 
        }).catch((ex) => { 
            alert(ex.message); 
        }); 
    } 
}; 
 
const props = defineProps({ 
    ue: { 
        type: Object as () => Ue | null, 
        required: false, 
        default: null, 
    }, 
}); 
 
const emit = defineEmits(['create:ue', 'update:ue']); 
 
onBeforeMount(() => { 
    if (props.ue) { 
        currentUe.value = props.ue; 
    } 
 
    // Chargement de la liste des parcours 
    ParcoursDAO.getInstance().list().then((parcours) => { 
        parcoursOptions.value = parcours 
    }); 
}); 
 
defineExpose({ 
    openForm, 
    closeForm, 
}); 
 
watch(() => props.ue, (newUE) => { 
    if (newUE) { 
        currentUe.value = newUE; 
        openForm(); 
    } 
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
        <template v-slot:title> 
            <template v-if="ue && ue.ID"> Modification de l'UE</template> 
            <template v-else> Nouvelle UE</template> 
        </template> 

        <template v-slot:body> 
            <div class="text-start mt-1 mb-1">
                <form> 
                    <CustomInput v-model="currentUe.NumeroUe" class="mt-2" id="numeroue" libelle="Numéro" type="text" 
                        placeholder="Numéro d'UE" :error="formErrors.NumeroUe" /> 
                    <CustomInput v-model="currentUe.Intitule" id="intitule" libelle="Intitulé" type="text" 
                        placeholder="Intitulé de l'UE" :error="formErrors.Intitule" /> 
                    <div class="form-group"> 
                        <label for="intitule">Parcours :</label> 
                        <v-select 
                            multiple 
                            label="NomParcours"
                            v-model="currentUe.Parcours" 
                            :options="parcoursOptions"
                            :reduce="(p: any) => p"
                            :getOptionKey="(p: any) => p.ID || p.id"
                        ></v-select> 
                        <div v-if="formErrors.parcours" class="invalid-feedback"> 
                            {{ formErrors.parcours }} 
                        </div> 
                    </div> 
                </form> 
            </div> 
            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm"> 
                Annuler 
            </CustomButton> 
            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveUe"> 
                Enregistrer 
            </CustomButton> 
        </template> 
    </CustomModal> 
</template>