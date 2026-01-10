<script setup lang="ts">
import { ref, onBeforeMount, watch, toRaw } from 'vue';
import { Toast } from '@/services/ToastService';
import { Etudiant } from '@/domain/entities/Etudiant';
import { Parcours } from '@/domain/entities/Parcours';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { parseParcoursNullable } from '@/domain/utils/parcoursHelper';
import { validateMinLength, validateEmail as validateEmailUtil } from '@/domain/utils/validators';

const emit = defineEmits(['create:etudiant', 'update:etudiant']);

const currentEtudiant = ref<Etudiant>(new Etudiant(null, null, null, null, null, null));
const isOpen = ref(false);
const formErrors = ref<{
    NumEtud: string | null;
    Nom: string | null;
    Prenom: string | null;
    Email: string | null;
}>({
    NumEtud: null,
    Nom: null,
    Prenom: null,
    Email: null,
});

const parcoursOptions = ref<Parcours[]>([]);
const originalParcoursId = ref<number | null>(null);

const openForm = (etudiant: Etudiant | null = null) => {
    isOpen.value = true;
    originalParcoursId.value = null;
    
    if (etudiant) {
        originalParcoursId.value = typeof etudiant.ParcoursSuivi === 'number' 
            ? etudiant.ParcoursSuivi 
            : (etudiant.ParcoursSuivi as any)?.ID || null;
        
        currentEtudiant.value = new Etudiant(
            etudiant.ID,
            etudiant.NumEtud,
            etudiant.Nom,
            etudiant.Prenom,
            etudiant.Email,
            parseParcoursNullable(etudiant.ParcoursSuivi, parcoursOptions.value)
        );
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentEtudiant.value = new Etudiant(null, null, null, null, null, null);
    originalParcoursId.value = null;
    formErrors.value = { NumEtud: null, Nom: null, Prenom: null, Email: null };
};

const hasErrors = () => {
    return formErrors.value.NumEtud || formErrors.value.Nom || formErrors.value.Prenom || formErrors.value.Email;
};

const saveEtudiant = async () => {
    validateNumEtud();
    validateNom();
    validatePrenom();
    validateEmail();
    
    if (hasErrors()) return;

    try {
        if (currentEtudiant.value.ID) {
            await EtudiantDAO.getInstance().update(currentEtudiant.value.ID, currentEtudiant.value, originalParcoursId.value);
            Toast.success('Étudiant mis à jour avec succès');
            emit('update:etudiant', JSON.parse(JSON.stringify(toRaw(currentEtudiant.value))));
            // Ce JSON.parse/JSON.stringify est utilisé pour cloner l'objet du front car les mises à jour renvoient une 204 No Content dans mon API
        } else {
            const newEtudiant = await EtudiantDAO.getInstance().create(currentEtudiant.value);
            Toast.success('Étudiant créé avec succès');
            emit('create:etudiant', newEtudiant);
        }
        closeForm();
    } catch (ex: any) {
        Toast.error(ex.message);
    }
};

const validateNumEtud = () => {
    formErrors.value.NumEtud = validateMinLength(currentEtudiant.value.NumEtud, 3, 'Le numéro étudiant');
};

const validateNom = () => {
    formErrors.value.Nom = validateMinLength(currentEtudiant.value.Nom, 2, 'Le nom');
};

const validatePrenom = () => {
    formErrors.value.Prenom = validateMinLength(currentEtudiant.value.Prenom, 2, 'Le prénom');
};

const validateEmail = () => {
    formErrors.value.Email = validateEmailUtil(currentEtudiant.value.Email);
};

onBeforeMount(async () => {
    parcoursOptions.value = await ParcoursDAO.getInstance().list();
});

defineExpose({
    openForm,
    closeForm,
});

watch(() => currentEtudiant.value.NumEtud, validateNumEtud);
watch(() => currentEtudiant.value.Nom, validateNom);
watch(() => currentEtudiant.value.Prenom, validatePrenom);
watch(() => currentEtudiant.value.Email, validateEmail);
</script>

<template>
    <CustomModal :isOpen="isOpen" @close="closeForm">
        <template #title>
            {{ currentEtudiant.ID ? 'Modifier l\'étudiant' : 'Nouvel étudiant' }}
        </template>

        <template #body>
            <form class="flex flex-col gap-4" @submit.prevent="saveEtudiant">
                <CustomInput 
                    v-model="currentEtudiant.NumEtud"
                    id="numetud"
                    libelle="Numéro étudiant"
                    type="text"
                    placeholder="Ex: E12345"
                    :error="formErrors.NumEtud"
                />

                <CustomInput 
                    v-model="currentEtudiant.Nom"
                    id="nom"
                    libelle="Nom"
                    type="text"
                    placeholder="Ex: Dupont"
                    :error="formErrors.Nom"
                />

                <CustomInput 
                    v-model="currentEtudiant.Prenom"
                    id="prenom"
                    libelle="Prénom"
                    type="text"
                    placeholder="Ex: Jean"
                    :error="formErrors.Prenom"
                />

                <CustomInput 
                    v-model="currentEtudiant.Email"
                    id="email"
                    libelle="Email"
                    type="email"
                    placeholder="Ex: jean.dupont@email.com"
                    :error="formErrors.Email"
                />

                <div class="flex flex-col gap-2">
                    <label class="font-medium text-gray-600 text-sm" for="parcours">Parcours suivi</label>
                    <v-select 
                        id="parcours"
                        label="NomParcours"
                        v-model="currentEtudiant.ParcoursSuivi" 
                        :options="parcoursOptions"
                        :getOptionKey="(p: any) => p.ID || p.id"
                        class="vue-select-custom"
                        placeholder="Sélectionner un parcours..."
                    ></v-select>
                </div>

                <div class="flex gap-3 justify-end mt-2">
                    <CustomButton variant="cancel" @click="closeForm">Annuler</CustomButton>
                    <CustomButton variant="submit">{{ currentEtudiant.ID ? 'Modifier' : 'Créer' }}</CustomButton>
                </div>
            </form>
        </template>
    </CustomModal>
</template>
