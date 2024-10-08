import { useEffect, useState } from 'react';
import { PedidoService } from '../../services/PedidoService';
import { Pedido } from '../../types/Pedidos/Pedido';
import '../../styles/pedidos.css';
import { EnumEstadoPedido } from '../../types/Pedidos/EnumEstadoPedido';
import { toast, Toaster } from 'sonner';
import { EnumTipoEnvio } from '../../types/Pedidos/EnumTipoEnvio';
import { Sucursal } from '../../types/Restaurante/Sucursal';
import { Empleado } from '../../types/Restaurante/Empleado';
import { mostrarFecha } from '../../utils/global_variables/const';
import ModalCrud from '../ModalCrud';
import DetallesPedido from './DetallesPedido';


const PedidosParaEntregar = () => {
    const [pedidosEntregables, setPedidos] = useState<Pedido[]>([]);

    useEffect(() => {
        setDatosFiltrados([]);
        buscarPedidos();
    }, []);

    useEffect(() => {
        checkPrivilegies();
    }, []);

    useEffect(() => {
        if (pedidosEntregables.length > 0) cantidadDatosMostrables(11);
    }, [pedidosEntregables]);

    async function checkPrivilegies() {
        if (empleado && empleado.privilegios?.length > 0) {
            try {
                empleado?.privilegios?.forEach(privilegio => {
                    if (privilegio.nombre === 'Empleados' && privilegio.permisos.includes('READ')) {
                        if (privilegio.permisos.includes('UPDATE')) {
                            setUpdateVisible(true);
                        }
                    }
                });
            } catch (error) {
                console.error('Error:', error);
            }
        } else if (sucursal && sucursal.id > 0) {
            setUpdateVisible(true);
        }
    }

    const [empleado] = useState<Empleado | null>(() => {
        const empleadoString = localStorage.getItem('empleado');

        return empleadoString ? (JSON.parse(empleadoString) as Empleado) : null;
    });

    const [sucursal] = useState<Sucursal | null>(() => {
        const sucursalString = localStorage.getItem('sucursal');

        return sucursalString ? (JSON.parse(sucursalString) as Sucursal) : null;
    });

    const [updateVisible, setUpdateVisible] = useState(false);

    const buscarPedidos = async () => {
        setDatosFiltrados([]);
        PedidoService.getPedidos(EnumEstadoPedido.COCINADOS)
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(a.fechaPedido).getTime() - new Date(b.fechaPedido).getTime());
                setPedidos(sortedData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const [isLoading, setIsLoading] = useState(false);

    async function handleEntregarPedido(pedido: Pedido) {
        setIsLoading(true);
        // Por default la entrega es en el restaurante
        let estadoPedido = EnumEstadoPedido.ENTREGADOS;

        // En caso de ser delivery pasa por un estado extra
        if (pedido.tipoEnvio === "DELIVERY") {
            estadoPedido = EnumEstadoPedido.EN_CAMINO;
        }

        toast.promise(PedidoService.updateEstadoPedido(pedido, estadoPedido), {
            loading: 'Entregando el pedido...',
            success: (message) => {
                buscarPedidos();
                return message;
            },
            error: (message) => {
                return message;
            },
            finally: () => {
                setIsLoading(false);
            }
        });
    }

    function filtrarId(filtro: number) {
        if (filtro > 0) {
            const filtradas = pedidosEntregables.filter(recomendacion =>
                recomendacion.id === filtro
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntregables.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntregables.length / cantidadProductosMostrables));
        }
    }

    async function handleCancelarPedido(pedido: Pedido) {
        setIsLoading(true);

        toast.promise(PedidoService.updateEstadoPedido(pedido, EnumEstadoPedido.RECHAZADOS), {
            loading: 'Rechazando el pedido...',
            success: (message) => {
                buscarPedidos();
                return message;
            },
            error: (message) => {
                return message;
            },
            finally: () => {
                setIsLoading(false);
            }
        });
    }


    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadProductosMostrables, setCantidadProductosMostrables] = useState(11);

    // Calcular el índice del primer y último elemento de la página actual
    const indexUltimoProducto = paginaActual * cantidadProductosMostrables;
    const indexPrimerProducto = indexUltimoProducto - cantidadProductosMostrables;

    // Obtener los elementos de la página actual
    const [datosFiltrados, setDatosFiltrados] = useState<Pedido[]>([]);

    const [paginasTotales, setPaginasTotales] = useState<number>(1);

    // Cambiar de página
    const paginate = (numeroPagina: number) => setPaginaActual(numeroPagina);

    function cantidadDatosMostrables(cantidad: number) {
        setCantidadProductosMostrables(cantidad);

        if (cantidad > pedidosEntregables.length) {
            setPaginasTotales(1);
            setDatosFiltrados(pedidosEntregables);
        } else {
            setPaginasTotales(Math.ceil(pedidosEntregables.length / cantidad));
            setDatosFiltrados(pedidosEntregables.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }

    function filtrarCliente(filtro: string) {
        if (filtro.length > 0) {
            const filtradas = pedidosEntregables.filter(recomendacion =>
                recomendacion.cliente.nombre.toLowerCase().includes(filtro.toLowerCase())
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntregables.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntregables.length / cantidadProductosMostrables));
        }
    }

    function filtrarEnvio(filtro: number) {
        if (filtro > 0) {
            const filtradas = pedidosEntregables.filter(recomendacion =>
                recomendacion.tipoEnvio === filtro
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntregables.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntregables.length / cantidadProductosMostrables));
        }
    }

    function filtrarMenus(filtro: string) {
        if (filtro.length > 0) {
            let filtradas = pedidosEntregables.filter(recomendacion =>
                recomendacion.detallesPedido.some(detalle =>
                    detalle.articuloMenu?.nombre.toLowerCase().includes(filtro.toLowerCase())
                )
            );

            if (filtradas.length === 0) {
                filtradas = pedidosEntregables.filter(recomendacion =>
                    recomendacion.detallesPedido.some(detalle =>
                        detalle.articuloVenta?.nombre.toLowerCase().includes(filtro.toLowerCase())
                    )
                );
            }

            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntregables.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntregables.length / cantidadProductosMostrables));
        }
    }

    function calcularTotal(pedido: Pedido) {
        let nuevoTotal = 0;
        pedido.detallesPedido.forEach(detalle => {
            if (detalle.articuloVenta && detalle.articuloVenta.precioVenta > 0) {
                nuevoTotal += detalle.cantidad * detalle.articuloVenta.precioVenta;
            } else if (detalle.articuloMenu && detalle.articuloMenu.precioVenta > 0) {
                nuevoTotal += detalle.cantidad * detalle.articuloMenu.precioVenta;
            } else if (detalle.promocion && detalle.promocion.detallesPromocion.length > 0) {
                nuevoTotal += detalle.promocion.precio * detalle.cantidad
            }
        });

        if (pedido.tipoEnvio === "RETIRO_EN_TIENDA") {
            nuevoTotal = nuevoTotal * (1 - 10 / 100);
        }
        
        return nuevoTotal.toLocaleString('es-AR')
    }

    const [showDetallesPedido, setShowDetallesPedido] = useState(false);

    const [selectedPedido, setSelectedPedido] = useState<Pedido>(new Pedido());
    const handleModalClose = () => {
        setShowDetallesPedido(false);
    };

    useEffect(() => {
        if (pedidosEntregables.length > 0) {
            setDatosFiltrados(pedidosEntregables.slice(indexPrimerProducto, indexUltimoProducto));
        } else {
            setDatosFiltrados([]);
        }
    }, [pedidosEntregables, paginaActual, cantidadProductosMostrables]);

    return (
        <div className="opciones-pantallas">
            <h1>- Pedidos listos -</h1>
            <Toaster />
            <hr />
            <ModalCrud isOpen={showDetallesPedido} onClose={handleModalClose}>
                <DetallesPedido pedido={selectedPedido} />
            </ModalCrud>

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
                            onChange={(e) => filtrarId(parseInt(e.target.value))}
                        />
                        <span>Filtrar pedido por ID</span>
                    </div>
                    <div className="inputBox-filtrado" style={{ marginRight: '10px' }}>
                        <input
                            type="text"
                            required
                            onChange={(e) => filtrarCliente(e.target.value)}
                        />
                        <span>Filtrar por cliente</span>
                    </div>
                    <div className="inputBox-filtrado" style={{ marginRight: '10px' }}>
                        <input
                            type="text"
                            required
                            onChange={(e) => filtrarMenus(e.target.value)}
                        />
                        <span>Filtrar por menú</span>
                    </div>
                    <div className="inputBox-filtrado" >
                        <select name="" id="" onChange={(e) => filtrarEnvio(parseInt(e.target.value))}>
                            <option value={0}>Seleccionar tipo de envío (Todos)</option>
                            <option value={EnumTipoEnvio.DELIVERY}>Retiro en tienda</option>
                            <option value={EnumTipoEnvio.RETIRO_EN_TIENDA}>Delivery</option>
                        </select>
                    </div>

                </div>
            </div>

            <div id="pedidos">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Tipo de envío</th>
                            <th>Menu</th>
                            <th>Total</th>
                            <th>Entregar</th>
                            <th>Cancelar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosFiltrados.map(pedido => (
                            <tr key={pedido.id}>
                                <td>{pedido.id}</td>
                                <td>
                                    <div>
                                        <p>{pedido.cliente?.nombre}</p>
                                        <p>{pedido.cliente?.telefono}</p>
                                        <p>{pedido.cliente?.email}</p>
                                        <p>{mostrarFecha(new Date(pedido.fechaPedido))}</p>
                                    </div>
                                </td>

                                {pedido.tipoEnvio === EnumTipoEnvio.DELIVERY ? (
                                    <td>{pedido.tipoEnvio?.toString().replace(/_/g, ' ')} <p>{pedido.domicilioEntrega?.calle} {pedido.domicilioEntrega?.numero} {pedido.domicilioEntrega?.localidad?.nombre}</p></td>
                                ) : (
                                    <td>{pedido.tipoEnvio?.toString().replace(/_/g, ' ')}</td>
                                )}
                                <td onClick={() => { setSelectedPedido(pedido); setShowDetallesPedido(true) }}>
                                    <button className="btn-accion-detalle">VER DETALLE</button>
                                </td>
                                <td>
                                    ${calcularTotal(pedido)}
                                </td>

                                <td>
                                    {updateVisible && (
                                        <button className='btn-accion-activar' onClick={() => handleEntregarPedido(pedido)} disabled={isLoading}>
                                            {isLoading ? 'Cargando...' : 'ENTREGAR ✓'}
                                        </button>
                                    )}
                                </td>
                                <td>
                                    {updateVisible && (
                                        <button className='btn-accion-eliminar' onClick={() => handleCancelarPedido(pedido)} disabled={isLoading}>
                                            {isLoading ? 'Cargando...' : 'CANCELAR ✓'}
                                        </button>
                                    )}
                                </td>
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
        </div >
    )
}

export default PedidosParaEntregar
