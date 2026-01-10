import type { Ue } from '../entities/Ue';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

/**
 * DAO pour les UE
 */
export class UeDAO implements IDAO<Ue> {
    private static instance: UeDAO;

    private constructor() { }

    public static getInstance(): UeDAO {
        if (!UeDAO.instance) {
            UeDAO.instance = new UeDAO();
        }
        return UeDAO.instance;
    }

    /**
     * Crée une nouvelle UE dans la base
     * @param data Données de la nouvelle UE
     * @returns L'UE créée avec son ID généré
     * @throws Error si la création échoue
     */
    public async create(data: Ue): Promise<Ue> {
        try {
            const response = await apiClient.post('/api/Ue', data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer l\'UE'));
        }
    }

    /**
     * Récupère une UE spécifique par son ID
     * @param id Identifiant de l'UE
     * @returns L'UE correspondante
     * @throws Error si la requête échoue
     */
    public async get(id: number): Promise<Ue> {
        try {
            const response = await apiClient.get(`/api/Ue/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer l\'UE'));
        }
    }

    /**
     * Met à jour une UE existante
     * @param id Identifiant de l'UE à modifier
     * @param data Nouvelles données de l'UE
     * @returns L'UE mise à jour
     * @throws Error si la mise à jour échoue
     */
    public async update(id: number, data: Ue): Promise<Ue> {
        try {
            const response = await apiClient.put(`/api/Ue/${id}`, data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour l\'UE'));
        }
    }

    /**
     * Supprime une UE de la base
     * @param id Identifiant de l'UE à supprimer
     * @throws Error si la suppression échoue
     */
    public async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Ue/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer l\'UE'));
        }
    }

    /**
     * Récupère toutes les UE depuis l'API
     * @returns Liste complète des UE
     * @throws Error si la récupération échoue
     */
    public async list(): Promise<Ue[]> {
        try {
            const response = await apiClient.get('/api/Ue');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer la liste des UEs'));
        }
    }
} 
