import { useEffect, useState } from 'react';
import { EmpleadoService } from '../../services/EmpleadoService';
import { PedidoService } from '../../services/PedidoService';
import { Pedido } from '../../types/Pedidos/Pedido';
import '../../styles/pedidos.css';
import { EnumEstadoPedido } from '../../types/Pedidos/EnumEstadoPedido';
import { toast, Toaster } from 'sonner';
import { EnumTipoEnvio } from '../../types/Pedidos/EnumTipoEnvio';


const PedidosParaEntregar = () => {
    const [pedidosEntregables, setPedidos] = useState<Pedido[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await EmpleadoService.checkUser();
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();

        buscarPedidos();

    }, []);

    const buscarPedidos = async () => {
        PedidoService.getPedidos(EnumEstadoPedido.COCINADOS)
            .then(data => {
                setPedidos(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    async function handleEntregarPedido(pedido: Pedido) {
        // Por default la entrega es en el restaurante
        let estadoPedido = EnumEstadoPedido.ENTREGADOS;

        // En caso de ser delivery pasa por un estado extra
        if (pedido.tipoEnvio === EnumTipoEnvio.DELIVERY) {
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
        });
        buscarPedidos();
    }

    async function handleCancelarPedido(pedido: Pedido) {
        toast.promise(PedidoService.updateEstadoPedido(pedido, EnumEstadoPedido.RECHAZADOS), {
            loading: 'Rechazando el pedido...',
            success: (message) => {
                buscarPedidos();
                return message;
            },
            error: (message) => {
                return message;
            },
        });
    }


    const [paginaActual, setPaginaActual] = useState(0);
    const [productosMostrables, setProductosMostrables] = useState<number>(10);

    // Calcular el índice del primer y último elemento de la página actual
    const indexUltimoProducto = paginaActual * productosMostrables;
    const indexPrimerProducto = indexUltimoProducto + productosMostrables;

    // Obtener los elementos de la página actual
    const pedidosFiltrados = pedidosEntregables.slice(indexUltimoProducto, indexPrimerProducto);

    const paginasTotales = Math.ceil(pedidosEntregables.length / productosMostrables);

    // Cambiar de página
    const paginate = (paginaActual: number) => setPaginaActual(paginaActual);

    return (

        <div className="opciones-pantallas">
            <h1>- Pedidos listos -</h1>
            <Toaster />
            <hr />
            <div id="pedidos">
                <select name="cantidadProductos" value={10} onChange={(e) => setProductosMostrables(parseInt(e.target.value))}>
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
                            <th>Cliente</th>
                            <th>Tipo de envío</th>
                            <th>Menu</th>
                            <th>Total</th>
                            <th>Entregar</th>
                            <th>Cancelar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidosFiltrados.map(pedido => (
                            <tr key={pedido.id}>
                                <td>
                                    <div>
                                        <p>{pedido.cliente?.nombre}</p>
                                        <p>{pedido.cliente?.telefono}</p>
                                        <p>{pedido.cliente?.email}</p>
                                    </div>
                                </td>
                                {pedido.tipoEnvio === EnumTipoEnvio.DELIVERY ? (
                                    <td>{pedido.tipoEnvio?.toString().replace(/_/g, ' ')} <p>{pedido.domicilioEntrega?.calle} {pedido.domicilioEntrega?.numero} {pedido.domicilioEntrega?.localidad?.nombre}</p></td>
                                ) : (
                                    <td>{pedido.tipoEnvio?.toString().replace(/_/g, ' ')}</td>
                                )}
                                <td>
                                    {pedido && pedido.detallesPedido && pedido.detallesPedido.map(detalle => (
                                        <div key={detalle.id}>
                                            <p>{detalle.cantidad} - {detalle.articuloMenu?.nombre}{detalle.articuloVenta?.nombre} </p>
                                        </div>
                                    ))}
                                </td>
                                <td><button onClick={() => handleEntregarPedido(pedido)}>Entregar</button></td>
                                <td><button onClick={() => handleCancelarPedido(pedido)}>Cancelar</button></td>
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
