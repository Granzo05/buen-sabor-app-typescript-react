import { ArticuloVenta } from "../Productos/ArticuloVenta";
import { Stock } from "./Stock";

export class StockArticuloVenta extends Stock {
    id: number = 0;
    articuloVenta: ArticuloVenta = new ArticuloVenta();
    borrado: string = '';

    constructor() {
        super();
    }
}