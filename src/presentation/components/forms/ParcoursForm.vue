<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { Toast } from '@/services/ToastService';
import { Parcours } from '@/domain/entities/Parcours';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { validateMinLength, validateYear } from '@/domain/utils/validators';

const emit = defineEmits(['create:parcours', 'update:parcours']); 

const props = defineProps({
    parcours: {
        type: Object as () => Parcours | null,
        required: false,
        default: null,
    },
});

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const formErrors = ref<{ 
  NomParcours: string | null; 
  AnneeFormation: string | null; 
}>({ 
  NomParcours: null, 
  AnneeFormation: null, 
}); 

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

const saveParcours = async () => { 
  if (formErrors.value.NomParcours || formErrors.value.AnneeFormation) return;

  try {
    if (currentParcours.value.ID) { 
      await ParcoursDAO.getInstance().update(currentParcours.value.ID, currentParcours.value);
      Toast.success('Parcours mis à jour avec succès');
      emit('update:parcours', JSON.parse(JSON.stringify(toRaw(currentParcours.value))));
    } else { 
      const newParcours = await ParcoursDAO.getInstance().create(currentParcours.value);
      Toast.success('Parcours créé avec succès');
      emit('create:parcours', newParcours);
    } 
    closeForm(); 
  } catch (ex: any) {
    Toast.error(ex.message); 
  }
}; 

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
  formErrors.value.NomParcours = validateMinLength(currentParcours.value.NomParcours, 3, 'Le nom du parcours');
});

watch(() => currentParcours.value.AnneeFormation, () => {
  formErrors.value.AnneeFormation = validateYear(currentParcours.value.AnneeFormation);
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