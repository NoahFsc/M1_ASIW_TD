import { Parcours } from '../entities/Parcours';

/**
 * Normalise une référence de parcours (ID ou objet) en nombre
 * Utilisé pour uniformiser les comparaisons (car en fonction du retour API des UEs on peut avoir l'un ou l'autre)
 */
const normalizeParcoursReference = (p: any): number | null => {
    if (!p) return null;
    return typeof p === 'number' ? p : p.ID;
};

/**
 * Convertit une référence de parcours en objet Parcours complet
 * Recherche dans la liste des parcours disponibles selon les IDs
 */
export const parseParcours = (p: any, parcoursOptions: Parcours[]): Parcours => {
    const id = normalizeParcoursReference(p);
    if (!id) return new Parcours(null, 'Parcours inconnu', null);
    
    if (typeof p === 'number') {
        return parcoursOptions.find(opt => opt.ID === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
};

/**
 * Version nullable de parseParcours
 * Retourne null si aucun parcours n'est fourni
 * Utilisée pour les étudiants sans parcours assigné
 */
export const parseParcoursNullable = (p: any, parcoursOptions: Parcours[]): Parcours | null => {
    if (!p) return null;
    return parseParcours(p, parcoursOptions);
};

/**
 * Récupère le nom d'un parcours
 * Utilisé pour l'affichage dans les tableaux et listes
 */
export const getParcoursNom = (parcours: any, parcoursMap: Map<number, Parcours>): string => {
    if (!parcours) return '-';
    
    const id = normalizeParcoursReference(parcours);
    if (id) {
        return parcoursMap.get(id)?.NomParcours || `ID ${id}`;
    }
    return parcours.NomParcours || '-';
};

/**
 * Extrait l'ID d'un parcours
 * Utilisé pour les filtrages dans UeDetailsView
 */
export const getParcoursId = (p: any): number => {
    return normalizeParcoursReference(p) || 0;
};
