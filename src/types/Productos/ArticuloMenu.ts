import { Articulo } from "./Articulo";
import { EnumTipoArticuloComida } from "./EnumTipoArticuloComida";
import { IngredienteMenu } from "../Ingredientes/IngredienteMenu";

export class ArticuloMenu extends Articulo{
    id: number = 0;
    nombre: string = '';
    tiempoCoccion: number = 0;
    tipo: EnumTipoArticuloComida | null = null;
    comensales: number = 0;
    descripcion: string = '';
    ingredientesMenu: IngredienteMenu[] | null = [];

    constructor() {
        super();
    }
}