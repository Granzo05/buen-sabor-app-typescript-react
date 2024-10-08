import { Domicilio } from "../Domicilio/Domicilio";
import { Categoria } from "../Ingredientes/Categoria";
import { ArticuloMenu } from "../Productos/ArticuloMenu";
import { ArticuloVenta } from "../Productos/ArticuloVenta";
import { Imagenes } from "../Productos/Imagenes";
import { Promocion } from "../Productos/Promocion";
import { Empresa } from "./Empresa";
import { LocalidadDelivery } from "./LocalidadDelivery";
import { PrivilegiosSucursales } from "./PrivilegiosSucursales";
import { Roles } from "./Roles";

export class Sucursal {
    id: number = 0;
    domicilios: Domicilio[] = [];
    nombre: string = '';
    contraseña: string = '';
    telefono: number = 0;
    email: string = '';
    horarioApertura: string = '';
    horarioCierre: string = '';
    localidadesDisponiblesDelivery: LocalidadDelivery[] = [];
    promociones: Promocion[] = [];
    articulosMenu: ArticuloMenu[] = [];
    articulosVenta: ArticuloVenta[] = [];
    empresa: Empresa = new Empresa();
    categorias: Categoria[] = [];
    imagenes: Imagenes[] = [];
    borrado: string = '';
    roles: Roles[] = [];
    privilegios: PrivilegiosSucursales[] = [];

    constructor() {

    }
}