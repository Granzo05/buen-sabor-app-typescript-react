import { Stock } from "./Stock";

export class StockIngredientesDTO extends Stock {
    id: number = 0;
    nombreIngrediente: string = '';
    tipo: string = '';

    constructor() {
        super();
    }
}