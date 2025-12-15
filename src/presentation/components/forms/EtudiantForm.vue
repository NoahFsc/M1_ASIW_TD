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

const parseParcours = (p: any): Parcours | null => {
    if (!p) return null;
    if (typeof p === 'number') {
        return parcoursOptions.value.find(opt => opt.ID === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
};

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
            parseParcours(etudiant.ParcoursSuivi)
        );
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentEtudiant.value = new Etudiant(null, null, null, null, null, null);
    originalParcoursId.value = null;
    formErrors.value = { NumEtud: null, Nom: null, Prenom: null, Email: null };
};

const emit = defineEmits(['create:etudiant', 'update:etudiant']);

const hasErrors = () => {
    return formErrors.value.NumEtud || formErrors.value.Nom || formErrors.value.Prenom || formErrors.value.Email;
};

const saveEtudiant = () => {
    validateNumEtud();
    validateNom();
    validatePrenom();
    validateEmail();
    
    if (hasErrors()) {
        return;
    }

    if (currentEtudiant.value.ID) {
        EtudiantDAO.getInstance().update(currentEtudiant.value.ID, currentEtudiant.value, originalParcoursId.value).then(() => {
            Toast.success('Étudiant mis à jour avec succès');
            emit('update:etudiant', JSON.parse(JSON.stringify(toRaw(currentEtudiant.value))));
            closeForm();
        }).catch((ex) => {
            Toast.error(ex.message);
        });
    } else {
        EtudiantDAO.getInstance().create(currentEtudiant.value).then((newEtudiant) => {
            Toast.success('Étudiant créé avec succès');
            emit('create:etudiant', newEtudiant);
            closeForm();
        }).catch((ex) => {
            Toast.error(ex.message);
        });
    }
};

const validateNumEtud = () => {
    if (!currentEtudiant.value.NumEtud || currentEtudiant.value.NumEtud.trim() === '') {
        formErrors.value.NumEtud = 'Le numéro étudiant est requis';
    } else if (currentEtudiant.value.NumEtud.length < 3) {
        formErrors.value.NumEtud = 'Le numéro étudiant doit faire au moins 3 caractères';
    } else {
        formErrors.value.NumEtud = null;
    }
};

const validateNom = () => {
    if (!currentEtudiant.value.Nom || currentEtudiant.value.Nom.trim() === '') {
        formErrors.value.Nom = 'Le nom est requis';
    } else if (currentEtudiant.value.Nom.length < 2) {
        formErrors.value.Nom = 'Le nom doit faire au moins 2 caractères';
    } else {
        formErrors.value.Nom = null;
    }
};

const validatePrenom = () => {
    if (!currentEtudiant.value.Prenom || currentEtudiant.value.Prenom.trim() === '') {
        formErrors.value.Prenom = 'Le prénom est requis';
    } else if (currentEtudiant.value.Prenom.length < 2) {
        formErrors.value.Prenom = 'Le prénom doit faire au moins 2 caractères';
    } else {
        formErrors.value.Prenom = null;
    }
};

const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEtudiant.value.Email || currentEtudiant.value.Email.trim() === '') {
        formErrors.value.Email = 'L\'email est requis';
    } else if (!emailRegex.test(currentEtudiant.value.Email)) {
        formErrors.value.Email = 'L\'email n\'est pas valide';
    } else {
        formErrors.value.Email = null;
    }
};

onBeforeMount(() => {
    ParcoursDAO.getInstance().list().then((parcours) => {
        parcoursOptions.value = parcours;
    });
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
            <form class="form-modern" @submit.prevent="saveEtudiant">
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

                <div class="form-group">
                    <label class="form-label" for="parcours">Parcours suivi</label>
                    <v-select 
                        id="parcours"
                        label="NomParcours"
                        v-model="currentEtudiant.ParcoursSuivi" 
                        :options="parcoursOptions"
                        :getOptionKey="(p: any) => p.ID || p.id"
                        class="form-select-modern"
                        placeholder="Sélectionner un parcours..."
                    ></v-select>
                </div>

                <div class="form-actions">
                    <CustomButton variant="cancel" @click="closeForm">Annuler</CustomButton>
                    <CustomButton variant="submit">{{ currentEtudiant.ID ? 'Modifier' : 'Créer' }}</CustomButton>
                </div>
            </form>
        </template>
    </CustomModal>
</template>
