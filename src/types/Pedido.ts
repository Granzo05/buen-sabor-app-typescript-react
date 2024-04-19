import { Factura } from "./Factura";
import { DetallePedido } from "./Detalles_pedido";
import { Restaurante } from "./Restaurante";
import { Cliente } from "./Cliente";

export class Pedido {
    id: number = 0;
    tipoEnvio: string= '' ;
    cliente: Cliente = new Cliente;
    restaurante: Restaurante = new Restaurante();
    factura: Factura = new Factura();
    estado: string = '';
    detalles: DetallePedido[] = [];

    constructor(){
        
    }
}