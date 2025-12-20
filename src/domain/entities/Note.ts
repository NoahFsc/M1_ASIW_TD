export interface INote {
    ID: number | null;
    Valeur: number;
    EtudiantId: number;
    UeId: number;
}

export class Note implements INote {
    constructor(
        public ID: number | null,
        public Valeur: number,
        public EtudiantId: number,
        public UeId: number
    ) {}

    toJSON(): Object {
        return {
            ID: this.ID,
            Valeur: this.Valeur,
            EtudiantId: this.EtudiantId,
            UeId: this.UeId
        };
    }
}
