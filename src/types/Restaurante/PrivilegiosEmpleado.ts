import { Privilegios } from "./Privilegios";

export class PrivilegiosEmpleados extends Privilegios {
    id: number = 0;
    permisos: string[] = [];

    constructor(id: number, permisos: string[], idPrivilegio: number, nombre: string, borrado: 'NO') {
        super(idPrivilegio, nombre, borrado)
        this.id = id;
        this.permisos = permisos;
    }
}