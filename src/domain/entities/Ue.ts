import { Parcours } from './Parcours'; 

export interface IUe {
  ID: number | null;
  NumeroUe: string | null;
  Intitule: string | null;
  Parcours: Parcours[] | null;

  toJSON(): Object;
}

export class Ue implements IUe {
  constructor(
    public ID: number | null,
    public NumeroUe: string | null,
    public Intitule: string | null,
    public Parcours: Parcours[] | null
  ) {}

  toJSON(): Object { 
    return { 
      ID: this.ID, 
      Intitule: this.Intitule, 
      NumeroUe: this.NumeroUe, 
      Parcours: this.Parcours?.map((p: any) => p.ID || p.id) || []
    };
  } 
}
