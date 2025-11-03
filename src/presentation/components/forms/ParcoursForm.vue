<script setup lang="ts">
import { ref, onBeforeMount, defineExpose, defineProps, toRaw, watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const openForm = (parcours: Parcours | null = null) => {
    isOpen.value = true;

    if (parcours) {
        currentParcours.value = structuredClone(toRaw(parcours));
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentParcours.value = new Parcours(null, null, null);
};

const emit = defineEmits(['create:parcours', 'update:parcours']); 

const saveParcours = () => { 

  if (formErrors.value.NomParcours || formErrors.value.AnneeFormation) { 
    return; 
  } 

  console.log('Saving parcours:', currentParcours.value);

  // TODO : régler côté back le retour pour avoir les champs en pascal case au lieu de camel case
  if (currentParcours.value.ID) { 
    ParcoursDAO.getInstance().update(currentParcours.value.ID, currentParcours.value).then((newParcours) => { 
      alert('Parcours mis à jour avec succès');
      emit('update:parcours', newParcours);
      closeForm(); 
    }).catch((ex) => { 
      alert(ex.message); 
    });
  } else { 
    ParcoursDAO.getInstance().create(currentParcours.value).then((newParcours) => { 
      alert('Parcours créé avec succès');
      emit('create:parcours', newParcours);
      closeForm(); 
    }).catch((ex) => { 
      alert(ex.message); 
    }); 
  } 

}; 

const props = defineProps({
    parcours: {
        type: Object as () => Parcours | null,
        required: false,
        default: null,
    },
});

const formErrors = ref<{ 
  NomParcours: string | null; 
  AnneeFormation: string | null; 
}>({ 
  NomParcours: null, 
  AnneeFormation: null, 
}); 

onBeforeMount(() => {
    if (props.parcours) {
        currentParcours.value = props.parcours;
    }
});

defineExpose({
    openForm,
    closeForm,
});

watch(() => currentParcours.value.NomParcours, () => { 

  if (!currentParcours.value.NomParcours || currentParcours.value.NomParcours.trim() === '' || currentParcours.value.NomParcours.length < 3) { 
    formErrors.value.NomParcours = 'Le nom du parcours doit faire au moins 3 caractères'; 
  } else { 
    formErrors.value.NomParcours = null; 
  } 

});

watch(() => currentParcours.value.AnneeFormation, () => {
  const annee = Number(currentParcours.value.AnneeFormation);
  if (currentParcours.value.AnneeFormation === null || Number.isNaN(annee) || annee < 2000 || annee > 2100) {
    formErrors.value.AnneeFormation = 'L\'année de formation doit être un nombre entre 2000 et 2100';
  } else {
    formErrors.value.AnneeFormation = null;
  }
});
</script>

<template>
    <div v-if="isOpen" class="custom-modal">
        <div class="card new-parcours">
            <div class="card-header" style="background: #273656">
                <template v-if="parcours && parcours.ID"> Modification du parcours </template>
                <template v-else> Nouveau parcours </template>
            </div>
            <div class="card-body">
                <div class="card-text mt-1 mb-1">
                    <form>
                        <CustomInput v-model="currentParcours.NomParcours" id="intitule" libelle="Intitulé" type="text" 
                            placeholder="Intitulé du parcours" :error="formErrors.NomParcours" /> 
                        <CustomInput v-model="currentParcours.AnneeFormation" class="mt-2" id="annee" libelle="Année" type="number"
                            placeholder="Année de formation" :error="formErrors.AnneeFormation" />
                    </form>
                </div>
                <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger"
                    @click="closeForm">
                    Annuler
                </CustomButton>
                <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary"
                    @click="saveParcours">
                    Enregistrer
                </CustomButton>
            </div>
        </div>
    </div>
</template>

<style scoped> 
.custom-modal { 
  position: absolute; 
  left: 0; 
  top: 0; 
  height: 100%; 
  width: 100%; 
  background-color: rgba(87, 86, 86, 0.5); 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  text-align: center; 
} 

.custom-modal .card { 
  width: 250px; 
} 

.card-header { 
  background: #273656; 
  color: white; 
  text-align: left; 
} 

.card-text { 
  text-align: left; 
} 
</style> 