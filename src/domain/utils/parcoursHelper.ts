import { Parcours } from '../entities/Parcours';

export const parseParcours = (p: any, parcoursOptions: Parcours[]): Parcours => {
    if (typeof p === 'number') {
        return parcoursOptions.find(opt => opt.ID === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
};

export const parseParcoursNullable = (p: any, parcoursOptions: Parcours[]): Parcours | null => {
    if (!p) return null;
    return parseParcours(p, parcoursOptions);
};

export const getParcoursNom = (parcours: any, parcoursMap: Map<number, Parcours>): string => {
    if (!parcours) return '-';
    
    if (typeof parcours === 'number') {
        return parcoursMap.get(parcours)?.NomParcours || `ID ${parcours}`;
    }
    return parcours.NomParcours || '-';
};

export const getParcoursId = (p: any): number => {
    return typeof p === 'number' ? p : p.ID;
};
