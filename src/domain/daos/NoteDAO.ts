import type { Note } from '../entities/Note';
import apiClient from '../config/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';

/**
 * DAO pour les notes d'étudiants
 */
export class NoteDAO {
    private static instance: NoteDAO;
    
    private constructor() {}

    public static getInstance(): NoteDAO {
        if (!NoteDAO.instance) {
            NoteDAO.instance = new NoteDAO();
        }
        return NoteDAO.instance;
    }

    /**
     * Récupère toutes les notes depuis l'API
     * @returns Liste complète de toutes les notes
     * @throws Error si la récupération échoue
     */
    public async list(): Promise<Note[]> {
        try {
            const response = await apiClient.get('/api/note');
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer les notes'));
        }
    }

    /**
     * Récupère toutes les notes d'une UE spécifique
     * Utilisé pour afficher les notes dans la page de détail UE
     * @param ueId Identifiant de l'UE
     * @returns Liste des notes pour cette UE
     * @throws Error si la récupération échoue
     */
    public async listByUe(ueId: number): Promise<Note[]> {
        try {
            const response = await apiClient.get(`/api/note/ue/${ueId}`);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de récupérer les notes de l\'UE'));
        }
    }

    /**
     * Crée une nouvelle note dans la base
     * @param data Objet contenant EtudiantId, UeId et Valeur
     * @returns La note créée
     * @throws Error si la création échoue (notamment si note existe déjà)
     */
    public async create(data: { EtudiantId: number; UeId: number; Valeur: number }): Promise<Note> {
        try {
            const response = await apiClient.post('/api/note', data);
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de créer la note'));
        }
    }

    /**
     * Met à jour une note existante
     * @param etudiantId Identifiant de l'étudiant
     * @param ueId Identifiant de l'UE
     * @param valeur Nouvelle valeur de la note
     * @returns La note mise à jour
     * @throws Error si la mise à jour échoue
     */
    public async update(etudiantId: number, ueId: number, valeur: number): Promise<Note> {
        try {
            const response = await apiClient.put(`/api/note/${etudiantId}/ue/${ueId}`, { Valeur: valeur });
            return response.data;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de mettre à jour la note'));
        }
    }

    /**
     * Supprime une note de la base
     * @param etudiantId Identifiant de l'étudiant
     * @param ueId Identifiant de l'UE
     * @throws Error si la suppression échoue
     */
    public async delete(etudiantId: number, ueId: number): Promise<void> {
        try {
            await apiClient.delete(`/api/note/${etudiantId}/ue/${ueId}`);
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Impossible de supprimer la note'));
        }
    }
}
