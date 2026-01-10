import type { Etudiant } from '../entities/Etudiant';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

/**
 * DAO pour les étudiants
 */
export class EtudiantDAO implements IDAO<Etudiant> {
    private static instance: EtudiantDAO;

    private constructor() {}

    public static getInstance(): EtudiantDAO {
        if (!EtudiantDAO.instance) {
            EtudiantDAO.instance = new EtudiantDAO();
        }
        return EtudiantDAO.instance;
    }

    /**
     * Récupère un étudiant spécifique par son ID
     * @param id Identifiant unique de l'étudiant
     * @returns L'étudiant correspondant
     * @throws Error si la requête échoue
     */
    public async get(id: number): Promise<Etudiant> {
        try {
            const response = await apiClient.get(`/api/Etudiant/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer l\'étudiant'));
        }
    }

    /**
     * Crée un nouvel étudiant dans la base
     * @param data Données du nouvel étudiant (converti en JSON avant envoi)
     * @returns L'étudiant créé avec son ID généré
     * @throws Error si la création échoue
     */
    public async create(data: Etudiant): Promise<Etudiant> {
        try {
            const response = await apiClient.post('/api/Etudiant', data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer l\'étudiant'));
        }
    }

    /**
     * Met à jour un étudiant existant
     * Gère automatiquement le changement de parcours si nécessaire
     * @param id Identifiant de l'étudiant à modifier
     * @param data Nouvelles données de l'étudiant
     * @param oldParcoursId Ancien parcours pour détecter les changements (null si pas de parcours)
     * @returns L'étudiant mis à jour
     * @throws Error si la mise à jour échoue
     */
    public async update(id: number, data: Etudiant, oldParcoursId: number | null = null): Promise<Etudiant> {
        const newParcoursId = data.ParcoursSuivi?.ID || null;
        
        // Gérer le changement de parcours seulement si différent
        if (newParcoursId !== oldParcoursId) {
            if (newParcoursId) {
                await this.addToParcours(newParcoursId, id);
            } else if (oldParcoursId) {
                await this.removeFromParcours(oldParcoursId, id);
            }
        }
        
        try {
            const response = await apiClient.put(`/api/Etudiant/${id}`, data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour l\'étudiant'));
        }
    }

    /**
     * Ajoute un étudiant à un parcours
     * Appelé automatiquement lors de la mise à jour d'un étudiant avec nouveau parcours
     * @param parcoursId Identifiant du parcours
     * @param etudiantId Identifiant de l'étudiant
     * @throws Error si l'ajout échoue
     */
    public async addToParcours(parcoursId: number, etudiantId: number): Promise<void> {
        try {
            await apiClient.post(`/api/Parcours/${parcoursId}/etudiants/${etudiantId}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible d\'ajouter l\'étudiant au parcours'));
        }
    }

    /**
     * Retire un étudiant d'un parcours
     * Appelé automatiquement lors du changement ou suppression de parcours d'un étudiant
     * @param parcoursId Identifiant du parcours
     * @param etudiantId Identifiant de l'étudiant
     * @throws Error si le retrait échoue
     */
    public async removeFromParcours(parcoursId: number, etudiantId: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Parcours/${parcoursId}/etudiants/${etudiantId}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de retirer l\'étudiant du parcours'));
        }
    }

    /**
     * Supprime un étudiant de la base
     * @param id Identifiant de l'étudiant à supprimer
     * @throws Error si la suppression échoue
     */
    public async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Etudiant/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer l\'étudiant'));
        }
    }

    /**
     * Récupère tous les étudiants depuis l'API
     * @returns Liste complète des étudiants
     * @throws Error si la récupération échoue
     */
    public async list(): Promise<Etudiant[]> {
        try {
            const response = await apiClient.get('/api/Etudiant');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer la liste des étudiants'));
        }
    }
}
