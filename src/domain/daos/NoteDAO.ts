import type { Note } from '../entities/Note';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

export class NoteDAO {
    private static instance: NoteDAO;
    
    private constructor() {}

    public static getInstance(): NoteDAO {
        if (!NoteDAO.instance) {
            NoteDAO.instance = new NoteDAO();
        }
        return NoteDAO.instance;
    }

    public async list(): Promise<Note[]> {
        try {
            const response = await apiClient.get('/api/note');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer les notes'));
        }
    }

    public async listByUe(ueId: number): Promise<Note[]> {
        try {
            const response = await apiClient.get(`/api/note/ue/${ueId}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer les notes de l\'UE'));
        }
    }

    public async create(data: { EtudiantId: number; UeId: number; Valeur: number }): Promise<Note> {
        try {
            const response = await apiClient.post('/api/note', data);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer la note'));
        }
    }

    public async update(etudiantId: number, ueId: number, valeur: number): Promise<Note> {
        try {
            const response = await apiClient.put(`/api/note/${etudiantId}/ue/${ueId}`, { Valeur: valeur });
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour la note'));
        }
    }

    public async delete(etudiantId: number, ueId: number): Promise<void> {
        try {
            await apiClient.delete(`/api/note/${etudiantId}/ue/${ueId}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer la note'));
        }
    }
}
