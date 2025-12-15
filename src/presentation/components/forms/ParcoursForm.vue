<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { Toast } from '@/services/ToastService';
import { Parcours } from '@/domain/entities/Parcours';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
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

  console.log('Parcours sauvegardé :', currentParcours.value);

  if (currentParcours.value.ID) { 
    ParcoursDAO.getInstance().update(currentParcours.value.ID, currentParcours.value).then(() => { 
      Toast.success('Parcours mis à jour avec succès');
      emit('update:parcours', structuredClone(toRaw(currentParcours.value))); // Comme mon API renvoie une 204 No Content, je copie le content pour mettre à jour automatiquement l'affichage du tableau
      closeForm(); 
    }).catch((ex) => { 
      Toast.error(ex.message); 
    });
  } else { 
    ParcoursDAO.getInstance().create(currentParcours.value).then((newParcours) => { 
      Toast.success('Parcours créé avec succès');
      emit('create:parcours', newParcours);
      closeForm(); 
    }).catch((ex) => { 
      Toast.error(ex.message); 
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
  if (currentParcours.value.AnneeFormation === null || Number.isNaN(annee) || annee > new Date().getFullYear()) {
    formErrors.value.AnneeFormation = 'L\'année de formation ne doit pas être dans le futur';
  } else {
    formErrors.value.AnneeFormation = null;
  }
});
</script>

<template> 
  <CustomModal :isOpen="isOpen" @close="closeForm"> 
    <template v-slot:title> 
      <template v-if="currentParcours.ID">Modifier le parcours</template> 
      <template v-else>Nouveau parcours</template> 
    </template>

    <template v-slot:body> 
      <form class="form-modern" @submit.prevent="saveParcours">
        <CustomInput 
          v-model="currentParcours.NomParcours" 
          id="intitule" 
          libelle="Intitulé" 
          type="text" 
          placeholder="Ex: MIAGE"
          :error="formErrors.NomParcours"
        />

        <CustomInput 
          v-model="currentParcours.AnneeFormation" 
          id="annee" 
          libelle="Année de formation" 
          type="number" 
          placeholder="Ex: 1"
          :error="formErrors.AnneeFormation"
        />

        <div class="form-actions">
          <CustomButton variant="cancel" @click="closeForm">Annuler</CustomButton>
          <CustomButton variant="submit">Enregistrer</CustomButton>
        </div>
      </form>
    </template> 
  </CustomModal> 
</template> 