import type { Ue } from '../entities/Ue';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

export class UeDAO implements IDAO<Ue> {
    private static instance: UeDAO;

    private constructor() { }

    public static getInstance(): UeDAO {
        if (!UeDAO.instance) {
            UeDAO.instance = new UeDAO();
        }
        return UeDAO.instance;
    }

    public async create(data: Ue): Promise<Ue> {
        try {
            const response = await apiClient.post('/api/Ue', data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer l\'UE'));
        }
    }

    public async get(id: number): Promise<Ue> {
        try {
            const response = await apiClient.get(`/api/Ue/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer l\'UE'));
        }
    }

    public async update(id: number, data: Ue): Promise<Ue> {
        try {
            const response = await apiClient.put(`/api/Ue/${id}`, data.toJSON());
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour l\'UE'));
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/api/Ue/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer l\'UE'));
        }
    }

    public async list(): Promise<Ue[]> {
        try {
            const response = await apiClient.get('/api/Ue');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer la liste des UEs'));
        }
    }
} 
