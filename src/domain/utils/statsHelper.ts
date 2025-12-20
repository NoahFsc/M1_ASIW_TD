import type { Parcours } from '../entities/Parcours';
import type { Ue } from '../entities/Ue';
import type { Etudiant } from '../entities/Etudiant';
import type { Note } from '../entities/Note';

export interface DashboardStats {
    totalParcours: number;
    totalUes: number;
    totalEtudiants: number;
    moyenneGenerale: number;
}

export interface ParcoursDistribution {
    labels: string[];
    data: number[];
}

export interface NotesDistribution {
    labels: string[];
    data: number[];
    colors: string[];
}

export interface TopUes {
    labels: string[];
    data: number[];
}

export function calculateDashboardStats(
    parcours: Parcours[],
    ues: Ue[],
    etudiants: Etudiant[],
    notes: Note[]
): DashboardStats {
    const moyenneGenerale = notes.length > 0
        ? notes.reduce((sum, note) => sum + note.Valeur, 0) / notes.length
        : 0;

    return {
        totalParcours: parcours.length,
        totalUes: ues.length,
        totalEtudiants: etudiants.length,
        moyenneGenerale: Math.round(moyenneGenerale * 100) / 100
    };
}

export function calculateParcoursDistribution(
    parcours: Parcours[],
    etudiants: Etudiant[]
): ParcoursDistribution {
    const distribution = new Map<number, { nom: string; count: number }>();
    
    parcours.forEach(p => {
        distribution.set(p.ID!, { nom: p.NomParcours || 'Sans nom', count: 0 });
    });

    etudiants.forEach(etudiant => {
        const parcoursId = typeof etudiant.ParcoursSuivi === 'number' 
            ? etudiant.ParcoursSuivi 
            : etudiant.ParcoursSuivi?.ID;
        
        if (parcoursId && distribution.has(parcoursId)) {
            const entry = distribution.get(parcoursId)!;
            entry.count++;
        }
    });

    const sorted = Array.from(distribution.values()).sort((a, b) => b.count - a.count);

    return {
        labels: sorted.map(d => d.nom),
        data: sorted.map(d => d.count)
    };
}

export function calculateNotesDistribution(notes: Note[]): NotesDistribution {
    const ranges = {
        'Excellent (≥16)': 0,
        'Bien (14-16)': 0,
        'Moyen (12-14)': 0,
        'Passable (10-12)': 0,
        'Insuffisant (<10)': 0
    };

    notes.forEach(note => {
        const val = note.Valeur;
        if (val >= 16) ranges['Excellent (≥16)']++;
        else if (val >= 14) ranges['Bien (14-16)']++;
        else if (val >= 12) ranges['Moyen (12-14)']++;
        else if (val >= 10) ranges['Passable (10-12)']++;
        else ranges['Insuffisant (<10)']++;
    });

    return {
        labels: Object.keys(ranges),
        data: Object.values(ranges),
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']
    };
}

export function calculateTopUes(
    ues: Ue[],
    notes: Note[]
): TopUes {
    const ueNotesCount = new Map<number, { nom: string; count: number }>();

    ues.forEach(ue => {
        ueNotesCount.set(ue.ID!, { nom: `${ue.NumeroUe} - ${ue.Intitule}`, count: 0 });
    });

    notes.forEach(note => {
        if (ueNotesCount.has(note.UeId)) {
            ueNotesCount.get(note.UeId)!.count++;
        }
    });

    const sorted = Array.from(ueNotesCount.values())
        .filter(d => d.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        labels: sorted.map(d => d.nom),
        data: sorted.map(d => d.count)
    };
}
