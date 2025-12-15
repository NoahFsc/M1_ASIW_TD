import type { Etudiant } from '../entities/Etudiant';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

export class EtudiantDAO implements IDAO<Etudiant> {
    private static instance: EtudiantDAO;

    private constructor() {}

    public static getInstance(): EtudiantDAO {
        if (!EtudiantDAO.instance) {
            EtudiantDAO.instance = new EtudiantDAO();
        }
        return EtudiantDAO.instance;
    }

    public async create(data: Etudiant): Promise<Etudiant> {
        try {
            const response = await apiClient.post('/api/Etudiant', data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer l\'étudiant'));
        }
    }

    public async get(id: number): Promise<Etudiant> {
        try {
            const response = await apiClient.get(`/api/Etudiant/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer l\'étudiant'));
        }
    }

    public async update(id: number, data: Etudiant, oldParcoursId: number | null = null): Promise<Etudiant> {
        const newParcoursId = data.ParcoursSuivi?.ID || null;
        
        // Gérer le changement de parcours
        if (newParcoursId) {
            // Ajouter au nouveau parcours (le backend gère le retrait de l'ancien si besoin)
            await this.addToParcours(newParcoursId, id);
        } else if (oldParcoursId) {
            // Retirer du parcours si on passe de "un parcours" à "aucun parcours"
            await this.removeFromParcours(oldParcoursId, id);
        }
        
        try {
            const response = await apiClient.put(`/api/Etudiant/${id}`, data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour l\'étudiant'));
        }
    }

    public async addToParcours(parcoursId: number, etudiantId: number): Promise<void> {
        try {
            await apiClient.post(`/api/Parcours/${parcoursId}/etudiants/${etudiantId}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible d\'ajouter l\'étudiant au parcours'));
        }
    }

    public async removeFromParcours(parcoursId: number, etudiantId: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Parcours/${parcoursId}/etudiants/${etudiantId}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de retirer l\'étudiant du parcours'));
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Etudiant/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer l\'étudiant'));
        }
    }

    public async list(): Promise<Etudiant[]> {
        try {
            const response = await apiClient.get('/api/Etudiant');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer la liste des étudiants'));
        }
    }
}
