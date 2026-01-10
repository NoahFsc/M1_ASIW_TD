import type { Parcours } from '../entities/Parcours';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

/**
 * DAO pour les parcours de formation
 */
export class ParcoursDAO implements IDAO<Parcours> {
    private static instance: ParcoursDAO;

    private constructor() { }
    
    public static getInstance(): ParcoursDAO {
        if (!ParcoursDAO.instance) {
            ParcoursDAO.instance = new ParcoursDAO();
        }
        return ParcoursDAO.instance;
    }

    /**
     * Récupère un parcours spécifique par son ID
     * @param id Identifiant unique du parcours
     * @returns Le parcours correspondant
     * @throws Error si la requête échoue
     */
    public async get(id: number): Promise<Parcours> {
        try {
            const response = await apiClient.get(`/api/Parcours/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer le parcours'));
        }
    }

    /**
     * Crée un nouveau parcours dans la base
     * @param data Données du nouveau parcours
     * @returns Le parcours créé avec son ID généré
     * @throws Error si la création échoue
     */
    public async create(data: Parcours): Promise<Parcours> {
        try {
            const response = await apiClient.post('/api/Parcours', data);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer le nouveau parcours'));
        }
    }

    /**
     * Met à jour un parcours existant
     * @param id Identifiant du parcours à modifier
     * @param data Nouvelles données du parcours
     * @returns Le parcours mis à jour
     * @throws Error si la mise à jour échoue
     */
    public async update(id: number, data: Parcours): Promise<Parcours> {
        try {
            const response = await apiClient.put(`/api/Parcours/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour le parcours'));
        }
    }

    /**
     * Supprime un parcours de la base
     * @param id Identifiant du parcours à supprimer
     * @throws Error si la suppression échoue
     */
    public async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Parcours/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer le parcours'));
        }
    }

    /**
     * Récupère tous les parcours depuis l'API
     * @returns Liste complète des parcours
     * @throws Error si la récupération échoue
     */
    public async list(): Promise<Parcours[]> {
        try {
            const response = await apiClient.get('/api/Parcours');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer la liste des parcours'));
        }
    }
}