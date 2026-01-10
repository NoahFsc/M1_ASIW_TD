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
import { createPopper } from '@popperjs/core';

// Utilisation de Popper pour les dropdowns de vue-select qui passaient derrière leurs conteneurs (ex. : dans "Parcours associés")
const withPopper = (dropdownList: HTMLElement, component: any, { width }: { width: string }) => {
    dropdownList.style.width = width;
    const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: 'bottom',
        modifiers: [
            {
                name: 'offset',
                options: { offset: [0, -1] }
            },
            {
                name: 'toggleClass',
                enabled: true,
                phase: 'write',
                fn({ state }) {
                    component.$el.classList.toggle('drop-up', state.placement === 'top');
                }
            }
        ]
    });
    return () => popper.destroy();
};

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

// Permet de récupérer la liste des parcours disponibles pour l'ajout dans l'UE
const availableParcours = computed(() => {
    if (!ue.value?.Parcours) return allParcours.value;
    const ueParcoursIds = ue.value.Parcours.map((p: any) => getParcoursId(p));
    return allParcours.value.filter(p => p.ID && !ueParcoursIds.includes(p.ID));
});

// Permet de récupérer la liste des étudiants inscrits dans les parcours de l'UE
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

// Sauvegarde les modifications des informations générales de l'UE
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

// Ajoute un parcours à l'UE
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

// Retire un parcours de l'UE
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

// Sauvegarde la note d'un étudiant pour cette UE
const saveNote = async (etudiant: Etudiant) => {
    if (!ue.value || !etudiant.ID) return;
    
    const inputValue = (noteInputs.value.get(etudiant.ID) || '').trim();
    
    // Si le champ est vide, on supprime la note existante
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
    
    // Validation de la note
    if (isNaN(valeur) || valeur < 0 || valeur > 20) {
        Toast.error('La note doit être entre 0 et 20');
        return;
    }
    
    // Si la note est valide, on la crée/met à jour
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

// Charge les notes des étudiants pour cette UE
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
    <div class="p-8 max-w-7xl mx-auto overflow-y-auto h-full">
        <div class="flex items-center gap-4 mb-8">
            <button class="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" @click="goBack">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h1 class="text-3xl font-bold text-gray-900">{{ ue?.NumeroUe }} - {{ ue?.Intitule }}</h1>
        </div>

        <div v-if="loading" class="text-center py-12 text-gray-500">Chargement...</div>

        <div v-else class="flex flex-col gap-6">
            <!-- Ligne contenant : Infos UE + Parcours -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Card Infos UE -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                        <i class="fa-solid fa-circle-info"></i>
                        Informations de l'UE
                    </div>
                    <div class="p-6">
                        <form @submit.prevent="saveUeInfo">
                            <div class="flex gap-4 items-end">
                                <div class="flex-1">
                                    <CustomInput 
                                        v-model="ue!.NumeroUe"
                                        id="numeroue"
                                        libelle="Numéro d'UE"
                                        type="text"
                                        placeholder="Ex: UE301"
                                        :error="formErrors.NumeroUe"
                                        @blur="validateNumeroUe"
                                    />
                                </div>
                                <div class="flex-1">
                                    <CustomInput 
                                        v-model="ue!.Intitule"
                                        id="intitule"
                                        libelle="Intitulé"
                                        type="text"
                                        placeholder="Ex: Développement Web"
                                        :error="formErrors.Intitule"
                                        @blur="validateIntitule"
                                    />
                                </div>
                                <button type="submit" class="bg-primary h-10 hover:bg-primary-hover w-10 flex items-center justify-center text-white rounded-lg cursor-pointer mt-6">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Card Parcours -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                        <i class="fa-solid fa-signs-post"></i>
                        Parcours associés
                    </div>
                    <div class="p-6">
                        <div class="flex gap-2 mb-4 items-center">
                            <v-select 
                                v-model="selectedParcoursId" 
                                :options="availableParcours"
                                :reduce="(p: Parcours) => p.ID"
                                label="NomParcours"
                                class="vue-select-custom flex-1"
                                placeholder="Ajouter un parcours..."
                                :append-to-body="true"
                                :calculate-position="withPopper"
                            ></v-select>
                            <button class="bg-primary hover:bg-primary-hover w-10 h-10 flex items-center justify-center text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="addParcours" :disabled="!selectedParcoursId">
                                <i class="fa-solid fa-check"></i>
                            </button>
                        </div>
                        
                        <div class="flex flex-wrap gap-2">
                            <span v-if="!ue?.Parcours?.length" class="text-gray-500 italic">Aucun parcours associé</span>
                            <span v-for="p in ue?.Parcours" :key="getParcoursId(p)" class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                {{ getParcoursNomLocal(p) }}
                                <button class="hover:bg-blue-200 rounded p-0.5 cursor-pointer" @click="removeParcours(getParcoursId(p))">
                                    <i class="fa-solid fa-xmark text-base"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ligne contenant : Étudiants & Notes -->
            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                    <i class="fa-solid fa-users"></i>
                    Étudiants & Notes
                </div>
                <div>
                    <div v-if="etudiantsUe.length === 0" class="p-6 text-gray-500 italic">
                        Aucun étudiant inscrit dans les parcours de cette UE.
                    </div>
                    <div v-else class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200">
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">N° Étudiant</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Nom</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Prénom</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide" style="width: 150px;">Note /20</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="etudiant in etudiantsUe" :key="etudiant.ID!" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ etudiant.NumEtud }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ etudiant.Nom }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ etudiant.Prenom }}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex gap-2 items-center">
                                            <input 
                                                type="text"
                                                class="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                :value="noteInputs.get(etudiant.ID!) || ''"
                                                @input="(e) => noteInputs.set(etudiant.ID!, (e.target as HTMLInputElement).value)"
                                                @keyup.enter="saveNote(etudiant)"
                                                placeholder="-"
                                            />
                                            <button class="bg-primary hover:bg-primary-hover w-8 h-8 flex items-center justify-center text-white rounded-lg cursor-pointer" @click="saveNote(etudiant)">
                                                <i class="fa-solid fa-check"></i>
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
