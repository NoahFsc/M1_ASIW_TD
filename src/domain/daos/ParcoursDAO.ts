import type { Parcours } from '../entities/Parcours';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

export class ParcoursDAO implements IDAO<Parcours> {
    private static instance: ParcoursDAO;

    private constructor() { }

    public static getInstance(): ParcoursDAO {
        if (!ParcoursDAO.instance) {
            ParcoursDAO.instance = new ParcoursDAO();
        }
        return ParcoursDAO.instance;
    }

    public async get(id: number): Promise<Parcours> {
        try {
            const response = await apiClient.get(`/api/Parcours/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer le parcours'));
        }
    }

    public async create(data: Parcours): Promise<Parcours> {
        try {
            const response = await apiClient.post('/api/Parcours', data);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer le nouveau parcours'));
        }
    }

    public async update(id: number, data: Parcours): Promise<Parcours> {
        try {
            const response = await apiClient.put(`/api/Parcours/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour le parcours'));
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Parcours/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer le parcours'));
        }
    }

    public async list(): Promise<Parcours[]> {
        try {
            const response = await apiClient.get('/api/Parcours');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer la liste des parcours'));
        }
    }
}