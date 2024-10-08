import { useEffect, useState } from 'react';
import { PedidoService } from '../../services/PedidoService';
import { Pedido } from '../../types/Pedidos/Pedido';
import '../../styles/pedidos.css';
import { EnumEstadoPedido } from '../../types/Pedidos/EnumEstadoPedido';
import { toast, Toaster } from 'sonner';
import { EnumTipoEnvio } from '../../types/Pedidos/EnumTipoEnvio';
import { mostrarFecha } from '../../utils/global_variables/const';
import { Sucursal } from '../../types/Restaurante/Sucursal';
import { Empleado } from '../../types/Restaurante/Empleado';
import { EmpleadoService } from '../../services/EmpleadoService';
import ModalCrud from '../ModalCrud';
import DetallesPedido from './DetallesPedido';


const PedidosEntrantes = () => {
    const [pedidosEntrantes, setPedidos] = useState<Pedido[]>([]);
    const [cantidadCocineros, setCantidadCocineros] = useState<number>(0);

    useEffect(() => {
        /*
        setInterval(() => {
            buscarPedidos();
        }, 25000);
        */
        buscarPedidos();
        buscarCantidadCocineros();
    }, []);

    const buscarPedidos = async () => {
        setDatosFiltrados([]);
        PedidoService.getPedidos(EnumEstadoPedido.ENTRANTES)
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(a.fechaPedido).getTime() - new Date(b.fechaPedido).getTime());
                setPedidos(sortedData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const buscarCantidadCocineros = async () => {
        EmpleadoService.getCantidadCocineros()
            .then(data => {
                setCantidadCocineros(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (pedidosEntrantes.length > 0) cantidadDatosMostrables(11);
    }, [pedidosEntrantes]);

    async function handleAceptarPedido(pedido: Pedido) {
        setIsLoading(true);

        const horaActual = new Date();

        // Calcular el tiempo de preparación en minutos
        const tiempoMayor: number = await calcularTiempoPreparacion(pedido);
        // Sumar los minutos del tiempo mayor al objeto Date
        horaActual.setMinutes(horaActual.getMinutes() + tiempoMayor);

        // Obtener horas y minutos de la hora estimada de finalización
        const horaFinalizacion = horaActual.getHours();

        const minutosFinalizacion = horaActual.getMinutes();

        // Formatear la hora estimada de finalización como una cadena HH:MM
        const horaFinalizacionFormateada = `${horaFinalizacion.toString().padStart(2, '0')}:${minutosFinalizacion.toString().padStart(2, '0')}`;

        // Asignar la hora de finalización al pedido
        pedido.horaFinalizacion = horaFinalizacionFormateada;

        toast.promise(
            PedidoService.updateEstadoPedido(pedido, EnumEstadoPedido.ACEPTADOS),
            {
                loading: 'Enviando pedido a cocina...',
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
            }
        );

    }

    async function calcularTiempoPreparacion(pedido: Pedido) {
        let tiempoTotal = 0;

        /*
        ∑ Sumatoria del tiempo estimado de los artículos manufacturados solicitados por el cliente en el pedido actual
        +
        ∑ Sumatoria del tiempo estimado de los artículos manufacturados que se encuentran en la cocina / cantidad cocineros
        +
        10 Minutos de entrega por delivery (solo si corresponde).
        */
        pedido.detallesPedido.forEach(detalle => {
            if (detalle.articuloMenu) {
                tiempoTotal += detalle.articuloMenu.tiempoCoccion;
            }
        });
        // Verificar que cantidadCocineros no sea 0 para evitar división por 0
        if (cantidadCocineros > 0) {
            tiempoTotal += tiempoTotal / cantidadCocineros;
        }

        // 10 Minutos de entrega por delivery (solo si corresponde)
        if (pedido.tipoEnvio === 'DELIVERY') {
            tiempoTotal += 10;
        }

        return tiempoTotal;
    }



    async function handleRechazarPedido(pedido: Pedido) {
        setIsLoading(true);

        toast.promise(PedidoService.updateEstadoPedido(pedido, EnumEstadoPedido.RECHAZADOS), {
            loading: 'Rechazando pedido...',
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
            const filtradas = pedidosEntrantes.filter(recomendacion =>
                recomendacion.id === filtro
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntrantes.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntrantes.length / cantidadProductosMostrables));
        }
    }

    useEffect(() => {
        checkPrivilegies();
    }, []);

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

        if (cantidad > pedidosEntrantes.length) {
            setPaginasTotales(1);
            setDatosFiltrados(pedidosEntrantes);
        } else {
            setPaginasTotales(Math.ceil(pedidosEntrantes.length / cantidad));
            setDatosFiltrados(pedidosEntrantes.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }

    function filtrarCliente(filtro: string) {
        if (filtro.length > 0) {
            const filtradas = pedidosEntrantes.filter(recomendacion =>
                recomendacion.cliente.nombre.toLowerCase().includes(filtro.toLowerCase())
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntrantes.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntrantes.length / cantidadProductosMostrables));
        }
    }

    function filtrarEnvio(filtro: number) {
        if (filtro > 0) {
            const filtradas = pedidosEntrantes.filter(recomendacion =>
                recomendacion.tipoEnvio === filtro
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntrantes.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntrantes.length / cantidadProductosMostrables));
        }
    }

    function filtrarMenus(filtro: string) {
        if (filtro.length > 0) {
            let filtradas = pedidosEntrantes.filter(recomendacion =>
                recomendacion.detallesPedido.some(detalle =>
                    detalle.articuloMenu?.nombre.toLowerCase().includes(filtro.toLowerCase())
                )
            );

            if (filtradas.length === 0) {
                filtradas = pedidosEntrantes.filter(recomendacion =>
                    recomendacion.detallesPedido.some(detalle =>
                        detalle.articuloVenta?.nombre.toLowerCase().includes(filtro.toLowerCase())
                    )
                );
            }

            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(pedidosEntrantes.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(pedidosEntrantes.length / cantidadProductosMostrables));
        }
    }

    useEffect(() => {
        if (pedidosEntrantes.length > 0) {
            setDatosFiltrados(pedidosEntrantes.slice(indexPrimerProducto, indexUltimoProducto));
        } else {
            setDatosFiltrados([]);
        }
    }, [pedidosEntrantes, paginaActual, cantidadProductosMostrables]);

    const [showDetallesPedido, setShowDetallesPedido] = useState(false);

    const [selectedPedido, setSelectedPedido] = useState<Pedido>(new Pedido());
    const handleModalClose = () => {
        setShowDetallesPedido(false);
    };
    return (

        <div className="opciones-pantallas">
            <Toaster />
            <h1>- Pedidos entrantes -</h1>
            <ModalCrud isOpen={showDetallesPedido} onClose={handleModalClose}>
                <DetallesPedido pedido={selectedPedido} />
            </ModalCrud>
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
                    <div className="inputBox-filtrado">
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
                            <th>Aceptar</th>
                            <th>Rechazar</th>
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
                                    <td>
                                        <p>{pedido.tipoEnvio?.toString().replace(/_/g, ' ')}</p>
                                    </td>
                                ) : (
                                    <td>
                                        <p>{pedido.tipoEnvio?.toString().replace(/_/g, ' ')}</p>
                                        <p>{pedido.domicilioEntrega?.calle} {pedido.domicilioEntrega?.numero} {pedido.domicilioEntrega?.localidad?.nombre}</p>
                                    </td>

                                )}
                                <td onClick={() => { setSelectedPedido(pedido); setShowDetallesPedido(true) }}>
                                    <button className="btn-accion-detalle">VER DETALLE</button>
                                </td>
                                <td>
                                    {updateVisible && (
                                        <button className='btn-accion-activar' onClick={() => handleAceptarPedido(pedido)} disabled={isLoading}>
                                            {isLoading ? 'Cargando...' : 'ACEPTAR ✓'}
                                        </button>
                                    )}
                                </td>

                                <td>
                                    {updateVisible && (
                                        <button className='btn-accion-eliminar' onClick={() => handleRechazarPedido(pedido)} disabled={isLoading}>
                                            {isLoading ? 'Cargando...' : 'RECHAZAR ✓'}
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

export default PedidosEntrantes
