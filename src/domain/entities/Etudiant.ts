import { Parcours } from './Parcours';

export interface IEtudiant {
    ID: number | null;
    NumEtud: string | null;
    Nom: string | null;
    Prenom: string | null;
    Email: string | null;
    ParcoursSuivi: Parcours | null;

    toJSON(): Object;
}

export class Etudiant implements IEtudiant {
    constructor(
        public ID: number | null,
        public NumEtud: string | null,
        public Nom: string | null,
        public Prenom: string | null,
        public Email: string | null,
        public ParcoursSuivi: Parcours | null
    ) {}

    toJSON(): Object {
        return {
            ID: this.ID,
            NumEtud: this.NumEtud,
            Nom: this.Nom,
            Prenom: this.Prenom,
            Email: this.Email,
            ParcoursSuivi: this.ParcoursSuivi?.ID || null
        };
    }
}
