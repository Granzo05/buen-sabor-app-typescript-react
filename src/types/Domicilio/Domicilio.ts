import { Localidad } from "./Localidad";

export class Domicilio {
    id: number = 0;
    calle: string = '';
    numero: number = 0;
    codigoPostal: number = 0;
    borrado: string = '';
    localidad: Localidad = new Localidad();

    constructor() {

    }

}