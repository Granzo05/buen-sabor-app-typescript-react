import { Stock } from "./Stock";

export class StockArticuloVentaDTO extends Stock {
    id: number = 0;
    nombreArticuloVenta: string = '';
    tipo: string = '';
    constructor() {
        super();
    }
}