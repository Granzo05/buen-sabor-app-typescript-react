import { ArticuloMenu } from "../Productos/ArticuloMenu";
import { ArticuloVenta } from "../Productos/ArticuloVenta";
import { Pedido } from "./Pedido";

export class DetallesPedido {
    id: number = 0;
    cantidad: number = 0;
    subTotal: number = 0;
    articuloMenu: ArticuloMenu | null = null;
    articuloVenta: ArticuloVenta | null = null;
    pedido: Pedido | null = null;
}