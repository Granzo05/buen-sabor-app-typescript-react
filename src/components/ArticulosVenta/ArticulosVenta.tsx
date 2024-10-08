import { useEffect, useState } from 'react';
import ModalCrud from "../ModalCrud";
import '../../styles/menuPorTipo.css';
import '../../styles/modalCrud.css';
import '../../styles/modalFlotante.css';
import { ArticuloVenta } from '../../types/Productos/ArticuloVenta';
import { ArticuloVentaService } from '../../services/ArticuloVentaService';
import AgregarArticuloVenta from './AgregarArticulo';
import EditarArticuloVenta from './EditarArticulo';
import EliminarArticuloVenta from './EliminarArticulo';
import ActivarArticuloVenta from './ActivarArticulo';
import '../../styles/articulosVenta.css'
import { Empleado } from '../../types/Restaurante/Empleado';
import { Sucursal } from '../../types/Restaurante/Sucursal';

const ArticuloVentas = () => {
    const [articulosVenta, setArticulosVenta] = useState<ArticuloVenta[]>([]);
    const [mostrarArticuloVenta, setMostrarArticuloVenta] = useState(true);

    const [showAgregarArticuloVentaModal, setShowAgregarArticuloVentaModal] = useState(false);
    const [showEditarArticuloVentaModal, setShowEditarArticuloVentaModal] = useState(false);
    const [showEliminarArticuloVentaModal, setShowEliminarArticuloVentaModal] = useState(false);
    const [showActivarArticuloVentaModal, setShowActivarArticuloVentaModal] = useState(false);

    const [selectedArticuloVenta, setSelectedArticuloVenta] = useState<ArticuloVenta | null>(null);

    useEffect(() => {
        setDatosFiltrados([]);
        checkPrivilegies();
        fetchArticuloVenta();
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

    const fetchArticuloVenta = async () => {
        setDatosFiltrados([]);
        try {
            ArticuloVentaService.getArticulos()
                .then(data => {
                    setArticulosVenta(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error al obtener empleados:', error);
        }
    };

    const handleAgregarArticuloVenta = () => {
        setShowAgregarArticuloVentaModal(true);
        setShowEditarArticuloVentaModal(false);
        setShowActivarArticuloVentaModal(false);
        setShowEliminarArticuloVentaModal(false);
        setMostrarArticuloVenta(false);
    };

    const handleEditarArticuloVenta = (articulo: ArticuloVenta) => {
        setSelectedArticuloVenta(articulo);
        setShowAgregarArticuloVentaModal(false);
        setShowEditarArticuloVentaModal(true);
        setShowActivarArticuloVentaModal(false);
        setShowEliminarArticuloVentaModal(false);
        setMostrarArticuloVenta(false);
    };

    const handleEliminarArticuloVenta = (articulo: ArticuloVenta) => {
        setSelectedArticuloVenta(articulo);
        setShowAgregarArticuloVentaModal(false);
        setShowEditarArticuloVentaModal(false);
        setShowActivarArticuloVentaModal(false);
        setShowEliminarArticuloVentaModal(true);
        setMostrarArticuloVenta(false);
    };

    const handleActivarArticuloVenta = (articulo: ArticuloVenta) => {
        setSelectedArticuloVenta(articulo);
        setShowAgregarArticuloVentaModal(false);
        setShowEditarArticuloVentaModal(false);
        setShowEliminarArticuloVentaModal(false);
        setShowActivarArticuloVentaModal(true);
        setMostrarArticuloVenta(false);
    };

    const handleModalClose = () => {
        setShowAgregarArticuloVentaModal(false);
        setShowActivarArticuloVentaModal(false);
        setShowEditarArticuloVentaModal(false);
        setShowEliminarArticuloVentaModal(false);
        setMostrarArticuloVenta(true);
        fetchArticuloVenta();
    };

    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadProductosMostrables, setCantidadProductosMostrables] = useState(11);

    // Calcular el índice del primer y último elemento de la página actual
    const indexUltimoProducto = paginaActual * cantidadProductosMostrables;
    const indexPrimerProducto = indexUltimoProducto - cantidadProductosMostrables;

    // Obtener los elementos de la página actual
    const [datosFiltrados, setDatosFiltrados] = useState<ArticuloVenta[]>([]);

    const [paginasTotales, setPaginasTotales] = useState<number>(1);

    // Cambiar de página
    const paginate = (numeroPagina: number) => setPaginaActual(numeroPagina);

    function cantidadDatosMostrables(cantidad: number) {
        setCantidadProductosMostrables(cantidad);

        if (cantidad > articulosVenta.length) {
            setPaginasTotales(1);
            setDatosFiltrados(articulosVenta);
        } else {
            setPaginasTotales(Math.ceil(articulosVenta.length / cantidad));
            setDatosFiltrados(articulosVenta.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }

    const [filtroNombre, setFiltroNombre] = useState('');

    useEffect(() => {
        filtrarNombre();
    }, [filtroNombre]);

    const filtrarNombre = () => {
        if (filtroNombre.length > 0 && datosFiltrados.length > 0) {
            setDatosFiltrados(datosFiltrados.filter(recomendacion =>
                recomendacion.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
            ));
        } else if (filtroNombre.length > 0 && articulosVenta.length > 0) {
            setDatosFiltrados(articulosVenta.filter(recomendacion =>
                recomendacion.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
            ));
        } else {
            setDatosFiltrados(articulosVenta.length > 0 ? articulosVenta : []);
            setPaginasTotales(Math.ceil(articulosVenta.length / cantidadProductosMostrables));
        }
    };

    const [precioBuscado, setPrecioBuscado] = useState<number>(0);
    const [signoPrecio, setSignoPrecio] = useState('>');

    useEffect(() => {
        filtrarPrecio();
    }, [signoPrecio, precioBuscado]);

    function filtrarPrecio() {
        const comparadores: { [key: string]: (a: number, b: number) => boolean } = {
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '=': (a, b) => a === b
        };

        if (precioBuscado > 0 && comparadores[signoPrecio] && datosFiltrados.length > 0) {
            setDatosFiltrados(datosFiltrados.filter(recomendacion =>
                comparadores[signoPrecio](recomendacion.precioVenta, precioBuscado)
            ));
            setPaginasTotales(Math.ceil(datosFiltrados.length / cantidadProductosMostrables));
        } else if (precioBuscado > 0 && articulosVenta.length > 0) {
            setDatosFiltrados(articulosVenta.filter(recomendacion =>
                comparadores[signoPrecio](recomendacion.precioVenta, precioBuscado)
            ));
            setPaginasTotales(Math.ceil(datosFiltrados.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(articulosVenta.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(articulosVenta.length / cantidadProductosMostrables));
        }
    }

    useEffect(() => {
        if (articulosVenta.length > 0) cantidadDatosMostrables(11);
    }, [articulosVenta]);

    useEffect(() => {
        if (articulosVenta.length > 0) {
            setDatosFiltrados(articulosVenta.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }, [articulosVenta, paginaActual, cantidadProductosMostrables]);

    return (
        <div className="opciones-pantallas">
            <h1>- Artículos -</h1>
            {createVisible && (
                <div className="btns-arts">
                    <button className='btn-agregar' onClick={() => handleAgregarArticuloVenta()}> + Agregar artículo</button>
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
                    <div className="inputBox-filtrado" style={{ marginRight: '10px' }}>
                        <input
                            type="text"
                            required
                            onChange={(e) => setFiltroNombre(e.target.value)}
                        />
                        <span>Filtrar por nombre</span>
                    </div>
                    <div className="inputBox-filtrado" >
                        <input
                            type="text"
                            required
                            onChange={(e) => setPrecioBuscado(parseInt(e.target.value))}
                        />
                        <span>Filtrar por precio</span>
                    </div>
                    <div className="inputBox-filtrado" style={{ marginLeft: '-15px' }}>
                        <select id="signos" name="signo" value={signoPrecio} onChange={(e) => setSignoPrecio(e.target.value)}>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                            <option value="=">=</option>
                        </select>
                    </div>
                </div>
            </div>
            {mostrarArticuloVenta && (
                <div id="menus">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosFiltrados.length > 0 && datosFiltrados.map(articulo => (
                                <tr key={articulo.id}>
                                    <td>{articulo.nombre}</td>
                                    <td>{articulo.cantidadMedida} {articulo.medida.nombre?.toString().replace(/_/g, ' ')}</td>
                                    <td>${articulo.precioVenta}</td>

                                    {articulo.borrado === 'NO' ? (
                                        <td>
                                            <div className="btns-articulos">
                                                {updateVisible && (
                                                    <button className='btn-accion-editar' onClick={() => handleEditarArticuloVenta(articulo)}>EDITAR</button>
                                                )}
                                                {deleteVisible && (
                                                    <button className='btn-accion-eliminar' onClick={() => handleEliminarArticuloVenta(articulo)}>ELIMINAR</button>
                                                )}
                                                {!updateVisible && !deleteVisible && (
                                                    <p>No tenes privilegios para interactuar con estos datos</p>
                                                )}
                                            </div>
                                        </td>
                                    ) : (
                                        <td>
                                            <div className="btns-articulos">
                                                {activateVisible && (
                                                    <button className='btn-accion-activar' onClick={() => handleActivarArticuloVenta(articulo)}>ACTIVAR</button>
                                                )}
                                                {updateVisible && (
                                                    <button className='btn-accion-editar' onClick={() => handleEditarArticuloVenta(articulo)}>EDITAR</button>
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

            <ModalCrud isOpen={showAgregarArticuloVentaModal} onClose={handleModalClose}>
                <AgregarArticuloVenta onCloseModal={handleModalClose} />
            </ModalCrud>
            <ModalCrud isOpen={showEditarArticuloVentaModal} onClose={handleModalClose}>
                {selectedArticuloVenta && <EditarArticuloVenta articuloOriginal={selectedArticuloVenta} onCloseModal={handleModalClose} />}
            </ModalCrud>
            <ModalCrud isOpen={showEliminarArticuloVentaModal} onClose={handleModalClose}>
                {selectedArticuloVenta && <EliminarArticuloVenta articuloOriginal={selectedArticuloVenta} onCloseModal={handleModalClose} />}
            </ModalCrud>
            <ModalCrud isOpen={showActivarArticuloVentaModal} onClose={handleModalClose}>
                {selectedArticuloVenta && <ActivarArticuloVenta articuloOriginal={selectedArticuloVenta} onCloseModal={handleModalClose} />}
            </ModalCrud>
        </div>

    )
}

export default ArticuloVentas
