import { useEffect, useState } from "react";
import ModalCrud from "../ModalCrud";
import '../../styles/stock.css';
import { CategoriaService } from "../../services/CategoriaService";
import { Categoria } from '../../types/Ingredientes/Categoria';
import EditarCategoria from "./EditarCategoria";
import AgregarCategoria from "./AgregarCategoria";
import '../../styles/categorias.css'
import { Empleado } from "../../types/Restaurante/Empleado";
import { Sucursal } from "../../types/Restaurante/Sucursal";
import ActivarCategoria from "./ActivarCategoria";
import EliminarCategoria from "./EliminarCategoria";

const Categorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [mostrarCategorias, setMostrarCategorias] = useState(true);

    const [showAgregarModalCategoria, setShowAgregarModalCategoria] = useState(false);
    const [showEditarCategoriaModal, setShowEditarCategoriaModal] = useState(false);
    const [showEliminarCategoriaModal, setShowEliminarCategoriaModal] = useState(false);
    const [showActivarCategoriaModal, setShowActivarCategoriaModal] = useState(false);

    const [selectedCategoria, setSelectedCategoria] = useState<Categoria>();

    useEffect(() => {
        setDatosFiltrados([]);
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        setDatosFiltrados([]);
        try {
            CategoriaService.getCategorias()
                .then(data => {
                    setCategorias(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        checkPrivilegies();
    }, []);

    const [empleado] = useState<Empleado | null>(() => {
        const empleadoString = localStorage.getItem('empleado');

        return empleadoString ? (JSON.parse(empleadoString) as Empleado) : null;
    });

    const [sucursal] = useState<Sucursal | null>(() => {
        const sucursalString = localStorage.getItem('sucursal');

        return sucursalString ? (JSON.parse(sucursalString) as Sucursal) : null;
    });

    const [createVisible, setCreateVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [activateVisible, setActivateVisible] = useState(false);

    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadProductosMostrables, setCantidadProductosMostrables] = useState(11);

    // Calcular el índice del primer y último elemento de la página actual
    const indexUltimoProducto = paginaActual * cantidadProductosMostrables;
    const indexPrimerProducto = indexUltimoProducto - cantidadProductosMostrables;

    // Obtener los elementos de la página actual
    const [datosFiltrados, setDatosFiltrados] = useState<Categoria[]>([]);

    const [paginasTotales, setPaginasTotales] = useState<number>(1);

    // Cambiar de página
    const paginate = (numeroPagina: number) => setPaginaActual(numeroPagina);

    function cantidadDatosMostrables(cantidad: number) {
        setCantidadProductosMostrables(cantidad);

        if (cantidad > categorias.length) {
            setPaginasTotales(1);
            setDatosFiltrados(categorias);
        } else {
            setPaginasTotales(Math.ceil(categorias.length / cantidad));
            setDatosFiltrados(categorias.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }

    function filtrarDatos(filtro: string) {
        if (filtro.length > 0) {
            const filtradas = categorias.filter(recomendacion =>
                recomendacion.nombre.toLowerCase().includes(filtro.toLowerCase())
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(categorias.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(categorias.length / cantidadProductosMostrables));
        }
    }

    useEffect(() => {
        if (categorias.length > 0) cantidadDatosMostrables(11);
    }, [categorias]);

    useEffect(() => {
        if (categorias.length > 0) {
            setDatosFiltrados(categorias.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }, [categorias, paginaActual, cantidadProductosMostrables]);

    async function checkPrivilegies() {
        if (empleado && empleado.privilegios?.length > 0) {
            try {
                empleado?.privilegios?.forEach(privilegio => {
                    if (privilegio.nombre === 'Empleados' && privilegio.permisos.includes('READ')) {
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
        } else if (sucursal && sucursal.id > 0) {
            setCreateVisible(true);
            setActivateVisible(true);
            setDeleteVisible(true);
            setUpdateVisible(true);
        }
    }

    const handleAgregarCategoria = () => {
        setShowEditarCategoriaModal(false);
        setShowEliminarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowAgregarModalCategoria(true);
    };

    const handleEditarCategoria = (categoria: Categoria) => {
        setSelectedCategoria(categoria);
        setShowAgregarModalCategoria(false);
        setShowEliminarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowEditarCategoriaModal(true);
    };

    const handleEliminarCategoria = (categoria: Categoria) => {
        setSelectedCategoria(categoria);
        setShowAgregarModalCategoria(false);
        setShowEditarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowActivarCategoriaModal(false);
        setShowEliminarCategoriaModal(true);
    };

    const handleActivarCategoria = (categoria: Categoria) => {
        setSelectedCategoria(categoria);
        setShowAgregarModalCategoria(false);
        setShowEditarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowActivarCategoriaModal(true);
        setShowEliminarCategoriaModal(false);
    };

    const handleModalClose = () => {
        setShowAgregarModalCategoria(false);
        setShowEditarCategoriaModal(false);
        setShowActivarCategoriaModal(false);
        setShowEliminarCategoriaModal(false);
        fetchCategorias();
        setMostrarCategorias(true);
    };

    return (
        <div className="opciones-pantallas">
            <h1>- Categorias -</h1>

            {createVisible && (
                <div className="btns-categorias">
                    <button className="btn-agregar" onClick={() => handleAgregarCategoria()}> + Agregar categoria</button>
                </div>
            )}
            <hr />
            <div className="filtros">
                <div className="inputBox-filtrado">
                    <select id="cantidad" name="cantidadProductos" value={cantidadProductosMostrables} onChange={(e) => cantidadDatosMostrables(parseInt(e.target.value))}>
                        <option value={11} disabled >Selecciona una cantidad a mostrar</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="filtros-datos">
                    <div className="inputBox-filtrado">
                        <input
                            type="text"
                            required
                            onChange={(e) => filtrarDatos(e.target.value)}
                        />
                        <span>Filtrar por nombre</span>
                    </div>
                </div>


            </div>
            {mostrarCategorias && (
                <div id="stocks">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosFiltrados.map(categoria => (
                                <tr key={categoria.id}>
                                    <td>{categoria.nombre.toString().replace(/_/g, ' ')}</td>

                                    {categoria.borrado === 'NO' ? (
                                        <td>
                                            <div className="btns-acciones">
                                                {updateVisible && (
                                                    <button className="btn-accion-editar" onClick={() => handleEditarCategoria(categoria)}>EDITAR</button>
                                                )}
                                                {deleteVisible && (
                                                    <button className="btn-accion-eliminar" onClick={() => handleEliminarCategoria(categoria)}>ELIMINAR</button>
                                                )}
                                                {!updateVisible && !deleteVisible && (
                                                    <p>No tenes privilegios para interactuar con estos datos</p>
                                                )}
                                            </div>

                                        </td>
                                    ) : (
                                        <td>
                                            <div className="btns-acciones">
                                                {updateVisible && (
                                                    <button className="btn-accion-editar" onClick={() => handleEditarCategoria(categoria)}>EDITAR</button>
                                                )}
                                                {activateVisible && (
                                                    <button className="btn-accion-activar" onClick={() => handleActivarCategoria(categoria)}>ACTIVAR</button>
                                                )}
                                                {!updateVisible && !activateVisible && (
                                                    <p>No tenes privilegios para interactuar con estos datos</p>
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
                </div>
            )}
            <ModalCrud isOpen={showAgregarModalCategoria} onClose={handleModalClose}>
                <AgregarCategoria onCloseModal={handleModalClose} />
            </ModalCrud>

            <ModalCrud isOpen={showEliminarCategoriaModal} onClose={handleModalClose}>
                {selectedCategoria && <EliminarCategoria categoriaOriginal={selectedCategoria} onCloseModal={handleModalClose} />}
            </ModalCrud>

            <ModalCrud isOpen={showActivarCategoriaModal} onClose={handleModalClose}>
                {selectedCategoria && <ActivarCategoria categoriaOriginal={selectedCategoria} onCloseModal={handleModalClose} />}
            </ModalCrud>

            <ModalCrud isOpen={showEditarCategoriaModal} onClose={handleModalClose}>
                {selectedCategoria && <EditarCategoria categoriaOriginal={selectedCategoria} onCloseModal={handleModalClose} />}
            </ModalCrud>
        </div>
    )
}

export default Categorias
