import { useEffect, useState } from "react";
import { SucursalService } from "../../services/SucursalService";
import AgregarSucursal from "./AgregarSucursal";
import ModalCrud from "../ModalCrud";
import EliminarSucursal from "./EliminarSucursal";
import EditarSucursal from "./EditarSucursal";
import { Sucursal } from "../../types/Restaurante/Sucursal";
import ActivarSucursal from "./ActivarSucursal";
import '../../styles/sucursales.css'
import { Empleado } from "../../types/Restaurante/Empleado";
import { PrivilegiosService } from "../../services/PrivilegiosService";
import { Privilegios } from "../../types/Restaurante/Privilegios";
import { DESACTIVAR_PRIVILEGIOS, getBaseUrl } from "../../utils/global_variables/const";
import { Empresa } from "../../types/Restaurante/Empresa";
import { toast, Toaster } from "sonner";
import { EmpresaService } from "../../services/EmpresaService";
import ModalFlotante from "../ModalFlotante";

const Sucursales = () => {
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [selectedSucursal, setSelectedSucursal] = useState<Sucursal>(new Sucursal());
    const [mostrarSucursales, setMostrarSucursales] = useState(true);

    const [showAgregarSucursalModal, setShowAgregarSucursalModal] = useState(false);
    const [showEditarSucursalModal, setShowEditarSucursalModal] = useState(false);
    const [showEliminarSucursalModal, setShowEliminarSucursalModal] = useState(false);
    const [showActivarSucursalModal, setShowActivarSucursalModal] = useState(false);

    useEffect(() => {
        if (sucursales.length === 0) fetchSucursales();
    }, [sucursales]);

    const fetchSucursales = async () => {
        SucursalService.getSucursales()
            .then(data => {
                setSucursales(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    const [privilegios, setPrivilegios] = useState<Privilegios[]>([]);
    const [idSucursalElegida, setIdSucursalElegida] = useState<number>();

    useEffect(() => {
        PrivilegiosService.getPrivilegios()
            .then(data => {
                setPrivilegios(data);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    const [empresa] = useState<Empresa | null>(() => {
        const empleadoString = localStorage.getItem('empresa');

        return empleadoString ? (JSON.parse(empleadoString) as Empresa) : null;
    });


    const [cuit, setCuit] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [showSolicitarCredenciales, setShowSolicitarCredencialesModal] = useState(false);

    const checkCredentials = () => {
        if (cuit.length === 0) {
            toast.error('Debe ingresar un cuit');
            return;
        } else if (contraseña.length === 0) {
            toast.error('Debe ingresar una contraseña');
            return;
        }

        toast.promise(EmpresaService.getEmpresaCredentials(cuit, contraseña), {
            loading: 'Revisando las credenciales...',
            success: (message) => {
                handleModalClose();
                handleAbrirSucursal();
                return message;
            },
            error: (message) => {
                return message;
            }
        });
    };

    const handleAbrirSucursal = () => {
        let restaurante = {
            id: idSucursalElegida,
            nombre: empresa?.razonSocial,
            empleadoPrivilegios: privilegios,
            empresa: empresa
        }

        localStorage.setItem('sucursal', JSON.stringify(restaurante));

        window.location.href = getBaseUrl() + '/opciones'
    };

    useEffect(() => {
        checkPrivilegies();
    }, []);

    const [empleado] = useState<Empleado | null>(() => {
        const empleadoString = localStorage.getItem('empleado');

        return empleadoString ? (JSON.parse(empleadoString) as Empleado) : null;
    });

    const [createVisible, setCreateVisible] = useState(DESACTIVAR_PRIVILEGIOS);
    const [updateVisible, setUpdateVisible] = useState(DESACTIVAR_PRIVILEGIOS);
    const [deleteVisible, setDeleteVisible] = useState(DESACTIVAR_PRIVILEGIOS);
    const [activateVisible, setActivateVisible] = useState(DESACTIVAR_PRIVILEGIOS);

    async function checkPrivilegies() {
        if (empleado && empleado.empleadoPrivilegios?.length > 0) {
            try {
                empleado?.empleadoPrivilegios?.forEach(privilegio => {
                    if (privilegio.privilegio.tarea === 'Sucursales' && privilegio.permisos.includes('READ')) {
                        if (privilegio.permisos.includes('CREATE')) {
                            setCreateVisible(true);
                        }
                        if (privilegio.permisos.includes('UPDATE')) {
                            setUpdateVisible(true);
                        }
                        if (privilegio.permisos.includes('DELETE')) {
                            setDeleteVisible(true);
                        }
                        if (privilegio.permisos.includes('ACTIVATE')) {
                            setActivateVisible(true);
                        }
                    }
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }


    const handleAgregarSucursal = () => {
        setShowAgregarSucursalModal(true);
        setMostrarSucursales(false);
    };

    const handleEditarSucursal = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setShowEditarSucursalModal(true);
        setMostrarSucursales(true);
    };

    const handleEliminarSucursal = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setShowEliminarSucursalModal(true);
        setMostrarSucursales(true);
    };

    const handleActivarSucursal = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setShowActivarSucursalModal(true);
        setMostrarSucursales(true);
    };

    const handleModalClose = () => {
        setShowAgregarSucursalModal(false);
        setShowEditarSucursalModal(false);
        setShowEliminarSucursalModal(false);
        setShowActivarSucursalModal(false);
        setShowSolicitarCredencialesModal(false);
        setMostrarSucursales(true);
        fetchSucursales();
    };


    const [paginaActual, setPaginaActual] = useState(1);
    const [productosMostrables, setProductosMostrables] = useState(10);

    // Calcular el índice del primer y último elemento de la página actual
    const indexUltimoProducto = paginaActual * productosMostrables;
    const indexPrimerProducto = indexUltimoProducto - productosMostrables;

    // Obtener los elementos de la página actual
    const sucursalesFiltradas = sucursales.slice(indexPrimerProducto, indexUltimoProducto);

    const paginasTotales = Math.ceil(sucursales.length / productosMostrables);

    // Cambiar de página
    const paginate = (paginaActual: number) => setPaginaActual(paginaActual);

    return (
        <div className="opciones-pantallas">
            <Toaster/>
            {showSolicitarCredenciales && (
                <ModalFlotante isOpen={showSolicitarCredenciales} onClose={handleModalClose}>
                    <div className='modal-info'>
                        <h2>Para acceder necesitamos que ingreses las credenciales de la empresa</h2>
                        <div className="inputBox">
                            <input autoComplete='false' type="text" value={cuit} required={true} onChange={(e) => { setCuit(e.target.value) }} />
                            <span>Cuit</span>
                        </div>

                        <div className="inputBox">
                            <input autoComplete='false' type="text" value={contraseña} required={true} onChange={(e) => { setContraseña(e.target.value) }} />
                            <span>Contraseña</span>
                        </div>
                        <button onClick={checkCredentials}>Confirmar</button>
                        <br />
                        <button onClick={handleModalClose}>Cancelar</button>
                    </div>
                </ModalFlotante>
            )}

            <h1>- Sucursales -</h1>
            {createVisible && (
                <div className="btns-sucursales">
                    <button className="btn-agregar" onClick={() => handleAgregarSucursal()}> + Agregar sucursal</button>
                </div>)}
            <hr />
            <ModalCrud isOpen={showAgregarSucursalModal} onClose={handleModalClose}>
                <AgregarSucursal onCloseModal={handleModalClose} />
            </ModalCrud>
            {mostrarSucursales && (
                <div id="sucursales">
                    <select name="cantidadProductos" value={productosMostrables} onChange={(e) => setProductosMostrables(parseInt(e.target.value))}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                    </select>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Telefono</th>
                                <th>Horario apertura</th>
                                <th>Horario cierre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sucursalesFiltradas.map(sucursal => (
                                <tr key={sucursal.id}>
                                    <td>{sucursal.nombre}</td>
                                    <td>{sucursal.telefono}</td>
                                    <td>{sucursal.horarioApertura}</td>
                                    <td>{sucursal.horarioCierre}</td>
                                    {sucursal.borrado === 'NO' ? (
                                        <td>
                                            <div className="btns-acciones">
                                                {createVisible && activateVisible && updateVisible && deleteVisible && (
                                                    <button className="btn-accion-abrir" onClick={() => { setIdSucursalElegida(sucursal.id); setShowSolicitarCredencialesModal(true) }}>ABRIR</button>
                                                )}
                                                {updateVisible && (
                                                    <button className="btn-accion-editar" onClick={() => handleEditarSucursal(sucursal)}>EDITAR</button>
                                                )}
                                                {deleteVisible && (
                                                    <button className="btn-accion-eliminar" onClick={() => handleEliminarSucursal(sucursal)}>ELIMINAR</button>
                                                )}
                                            </div>
                                        </td>
                                    ) : (
                                        <td>
                                            <div className="btns-acciones">
                                                {createVisible && activateVisible && updateVisible && deleteVisible && (
                                                    <button className="btn-accion-abrir" onClick={() => { setIdSucursalElegida(sucursal.id); setShowSolicitarCredencialesModal(true) }}>ABRIR</button>
                                                )}
                                                {activateVisible && (
                                                    <button className="btn-accion-activar" onClick={() => handleActivarSucursal(sucursal)}>ACTIVAR</button>
                                                )}
                                                {updateVisible && (
                                                    <button className="btn-accion-editar" onClick={() => handleEditarSucursal(sucursal)}>EDITAR</button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        {Array.from({ length: paginasTotales }, (_, index) => (
                            <button key={index + 1} onClick={() => paginate(index + 1)} disabled={paginaActual === index + 1}>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <ModalCrud isOpen={showEditarSucursalModal} onClose={handleModalClose}>
                        <EditarSucursal sucursalOriginal={selectedSucursal} onCloseModal={handleModalClose} />
                    </ModalCrud>
                    <ModalCrud isOpen={showEliminarSucursalModal} onClose={handleModalClose}>
                        {selectedSucursal && <EliminarSucursal sucursal={selectedSucursal} onCloseModal={handleModalClose} />}
                    </ModalCrud>
                    <ModalCrud isOpen={showActivarSucursalModal} onClose={handleModalClose}>
                        {selectedSucursal && <ActivarSucursal sucursal={selectedSucursal} onCloseModal={handleModalClose} />}
                    </ModalCrud>
                </div>
            )}

        </div>
    )
}

export default Sucursales
