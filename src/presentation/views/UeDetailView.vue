<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Toast } from '@/services/ToastService';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import { Ue } from '@/domain/entities/Ue';
import { Parcours } from '@/domain/entities/Parcours';
import { Etudiant } from '@/domain/entities/Etudiant';
import { UeDAO } from '@/domain/daos/UeDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { NoteDAO } from '@/domain/daos/NoteDAO';
import { parseParcours, getParcoursNom, getParcoursId } from '@/domain/utils/parcoursHelper';
import { validateMinLength } from '@/domain/utils/validators';

const route = useRoute();
const router = useRouter();

const ue = ref<Ue | null>(null);
const allParcours = ref<Parcours[]>([]);
const allEtudiants = ref<Etudiant[]>([]);
const notes = ref<Map<number, number>>(new Map());
const noteInputs = ref<Map<number, string>>(new Map());
const selectedParcoursId = ref<number | null>(null);
const loading = ref(true);

const formErrors = ref<{ NumeroUe: string | null; Intitule: string | null }>({
    NumeroUe: null,
    Intitule: null
});

const availableParcours = computed(() => {
    if (!ue.value?.Parcours) return allParcours.value;
    const ueParcoursIds = ue.value.Parcours.map((p: any) => getParcoursId(p));
    return allParcours.value.filter(p => p.ID && !ueParcoursIds.includes(p.ID));
});

const etudiantsUe = computed(() => {
    if (!ue.value?.Parcours) return [];
    const ueParcoursIds = ue.value.Parcours.map((p: any) => p.ID || p);
    return allEtudiants.value.filter(e => {
        const parcoursId = typeof e.ParcoursSuivi === 'number' 
            ? e.ParcoursSuivi 
            : e.ParcoursSuivi?.ID;
        return parcoursId && ueParcoursIds.includes(parcoursId);
    });
});

const validateNumeroUe = () => {
    formErrors.value.NumeroUe = validateMinLength(ue.value?.NumeroUe, 3, 'Le numéro d\'UE');
};

const validateIntitule = () => {
    formErrors.value.Intitule = validateMinLength(ue.value?.Intitule, 3, 'L\'intitulé');
};

const getParcoursNomLocal = (p: any): string => {
    if (typeof p === 'number') {
        return allParcours.value.find(par => par.ID === p)?.NomParcours || `Parcours ${p}`;
    }
    return p.NomParcours || '-';
};
const saveUeInfo = async () => {
    validateNumeroUe();
    validateIntitule();
    
    if (formErrors.value.NumeroUe || formErrors.value.Intitule || !ue.value) return;
    
    try {
        const existingParcours = (ue.value.Parcours || []).map(p => parseParcours(p, allParcours.value));
        const updatedUe = new Ue(
            ue.value.ID,
            ue.value.NumeroUe,
            ue.value.Intitule,
            existingParcours
        );
        
        await UeDAO.getInstance().update(ue.value.ID!, updatedUe);
        Toast.success('UE mise à jour avec succès');
    } catch (ex: any) {
        Toast.error(ex.message);
    }
};

const addParcours = async () => {
    if (!selectedParcoursId.value || !ue.value) return;
    
    const parcours = allParcours.value.find(p => p.ID === selectedParcoursId.value);
    if (!parcours) return;
    
    try {
        const existingParcours = (ue.value.Parcours || []).map(p => parseParcours(p, allParcours.value));
        const updatedUe = new Ue(
            ue.value.ID,
            ue.value.NumeroUe,
            ue.value.Intitule,
            [...existingParcours, parcours]
        );
        
        await UeDAO.getInstance().update(ue.value.ID!, updatedUe);
        ue.value.Parcours = updatedUe.Parcours;
        selectedParcoursId.value = null;
        Toast.success('Parcours ajouté');
        await loadNotes();
    } catch (ex: any) {
        Toast.error(ex.message);
    }
};

const removeParcours = async (parcoursId: number) => {
    if (!ue.value?.Parcours) return;
    
    const confirmed = await Toast.confirmDelete(
        'Retirer ce parcours ?',
        'Les étudiants de ce parcours ne seront plus associés à cette UE.'
    );
    
    if (!confirmed) return;
    
    try {
        const existingParcours = (ue.value.Parcours || []).map(p => parseParcours(p, allParcours.value));
        const updatedParcours = existingParcours.filter((p: Parcours) => p.ID !== parcoursId);
        const updatedUe = new Ue(
            ue.value.ID,
            ue.value.NumeroUe,
            ue.value.Intitule,
            updatedParcours
        );
        
        await UeDAO.getInstance().update(ue.value.ID!, updatedUe);
        ue.value.Parcours = updatedParcours;
        Toast.success('Parcours retiré');
    } catch (ex: any) {
        Toast.error(ex.message);
    }
};

const saveNote = async (etudiant: Etudiant) => {
    if (!ue.value || !etudiant.ID) return;
    
    const inputValue = (noteInputs.value.get(etudiant.ID) || '').trim();
    
    if (inputValue === '') {
        const existingNote = notes.value.has(etudiant.ID);
        if (!existingNote) return;
        
        try {
            await NoteDAO.getInstance().delete(etudiant.ID, ue.value.ID!);
            notes.value.delete(etudiant.ID);
            noteInputs.value.set(etudiant.ID, '');
            Toast.success('Note supprimée');
        } catch (ex: any) {
            Toast.error(ex.message);
        }
        return;
    }
    
    const valeur = parseFloat(inputValue.replace(',', '.'));
    
    if (isNaN(valeur) || valeur < 0 || valeur > 20) {
        Toast.error('La note doit être entre 0 et 20');
        return;
    }
    
    try {
        const existingNote = notes.value.has(etudiant.ID);
        
        if (existingNote) {
            await NoteDAO.getInstance().update(etudiant.ID, ue.value.ID!, valeur);
        } else {
            await NoteDAO.getInstance().create({
                EtudiantId: etudiant.ID,
                UeId: ue.value.ID!,
                Valeur: valeur
            });
        }
        
        notes.value.set(etudiant.ID, valeur);
        Toast.success('Note enregistrée');
    } catch (ex: any) {
        Toast.error(ex.message);
    }
};

const loadNotes = async () => {
    if (!ue.value?.ID) return;
    
    try {
        const notesList = await NoteDAO.getInstance().listByUe(ue.value.ID);
        notes.value.clear();
        noteInputs.value.clear();
        
        notesList.forEach((n: any) => {
            const etudiantId = n.EtudiantId || n.etudiantId;
            const valeur = n.Valeur || n.valeur;
            notes.value.set(etudiantId, valeur);
            noteInputs.value.set(etudiantId, valeur.toString());
        });
    } catch (ex: any) {
        console.error('Erreur chargement notes:', ex);
    }
};

const goBack = () => {
    router.push('/ues');
};

onMounted(async () => {
    const ueId = Number(route.params.id);
    
    try {
        const [ueData, parcoursData, etudiantsData] = await Promise.all([
            UeDAO.getInstance().get(ueId),
            ParcoursDAO.getInstance().list(),
            EtudiantDAO.getInstance().list()
        ]);
        
        ue.value = new Ue(ueData.ID, ueData.NumeroUe, ueData.Intitule, ueData.Parcours || []);
        allParcours.value = parcoursData;
        allEtudiants.value = etudiantsData;
        
        await loadNotes();
    } catch (ex: any) {
        Toast.error(ex.message);
        router.push('/ues');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="page-container">
        <div class="page-header">
            <div>
                <button class="btn-back" @click="goBack">
                    <i class="bi bi-arrow-left"></i>
                </button>
                <h1 class="page-title">{{ ue?.NumeroUe }} - {{ ue?.Intitule }}</h1>
            </div>
        </div>

        <div v-if="loading" class="loading">Chargement...</div>

        <div v-else class="cards-container">
            <!-- Row: Infos UE + Parcours -->
            <div class="cards-row">
                <!-- Card Infos UE -->
                <div class="card card-info">
                    <div class="card-header">
                        <i class="bi bi-info-circle"></i>
                        Informations de l'UE
                    </div>
                    <div class="card-body">
                        <form class="form-modern form-horizontal" @submit.prevent="saveUeInfo">
                            <CustomInput 
                                v-model="ue!.NumeroUe"
                                id="numeroue"
                                libelle="Numéro d'UE"
                                type="text"
                                placeholder="Ex: UE301"
                                :error="formErrors.NumeroUe"
                                @blur="validateNumeroUe"
                            />
                            <CustomInput 
                                v-model="ue!.Intitule"
                                id="intitule"
                                libelle="Intitulé"
                                type="text"
                                placeholder="Ex: Développement Web"
                                :error="formErrors.Intitule"
                                @blur="validateIntitule"
                            />
                            <button type="submit" class="btn-icon">
                                <i class="bi bi-check"></i>
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Card Parcours -->
                <div class="card card-parcours">
                    <div class="card-header">
                        <i class="bi bi-signpost-2"></i>
                        Parcours associés
                    </div>
                    <div class="card-body">
                        <div class="parcours-add">
                            <select v-model="selectedParcoursId" class="form-select">
                                <option :value="null" disabled>Ajouter un parcours...</option>
                                <option v-for="p in availableParcours" :key="p.ID!" :value="p.ID">
                                    {{ p.NomParcours }}
                                </option>
                            </select>
                            <button class="btn-icon" @click="addParcours" :disabled="!selectedParcoursId">
                                <i class="bi bi-plus-lg"></i>
                            </button>
                        </div>
                        
                        <div class="tags-container">
                            <span v-if="!ue?.Parcours?.length" class="text-muted">Aucun parcours associé</span>
                            <span v-for="p in ue?.Parcours" :key="getParcoursId(p)" class="tag">
                                {{ getParcoursNomLocal(p) }}
                                <button class="tag-remove" @click="removeParcours(getParcoursId(p))">
                                    <i class="bi bi-x"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card Étudiants & Notes -->
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-people"></i>
                    Étudiants & Notes
                </div>
                <div class="card-body">
                    <div v-if="etudiantsUe.length === 0" class="text-muted">
                        Aucun étudiant inscrit dans les parcours de cette UE.
                    </div>
                    <div v-else class="table-wrapper">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>N° Étudiant</th>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th style="width: 150px;">Note /20</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="etudiant in etudiantsUe" :key="etudiant.ID!">
                                    <td>{{ etudiant.NumEtud }}</td>
                                    <td class="name-col">{{ etudiant.Nom }}</td>
                                    <td>{{ etudiant.Prenom }}</td>
                                    <td>
                                        <div class="note-cell">
                                            <input 
                                                type="text"
                                                class="note-input"
                                                :value="noteInputs.get(etudiant.ID!) || ''"
                                                @input="(e) => noteInputs.set(etudiant.ID!, (e.target as HTMLInputElement).value)"
                                                @keyup.enter="saveNote(etudiant)"
                                                placeholder="-"
                                            />
                                            <button class="btn-icon" @click="saveNote(etudiant)">
                                                <i class="bi bi-check"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container { overflow-y: auto; height: 100%; }
.page-header > div { display: flex; align-items: center; gap: 1rem; }
.parcours-add { display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
.note-cell { display: flex; gap: 0.5rem; align-items: center; }
</style>
