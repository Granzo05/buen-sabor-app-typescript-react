import { useEffect, useState } from "react";
import { Carrito } from "../types/Pedidos/Carrito";
import { Cliente } from "../types/Cliente/Cliente";
import '../styles/pago.css';
import { Pedido } from "../types/Pedidos/Pedido";
import { PedidoService } from "../services/PedidoService";
import { EnumTipoEnvio } from "../types/Pedidos/EnumTipoEnvio";
import { DetallesPedido } from "../types/Pedidos/Detalles_pedido";
import { EnumEstadoPedido } from "../types/Pedidos/EnumEstadoPedido";
import { toast, Toaster } from "sonner";
import { Domicilio } from "../types/Domicilio/Domicilio";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InputComponent from "../components/InputFiltroComponent";
import ModalFlotanteRecomendacionesDomicilios from "../hooks/ModalFlotanteFiltroDomicilios";
import { StockArticuloVentaService } from "../services/StockArticulosService";
import { StockIngredientesService } from "../services/StockIngredientesService";
import { ArticuloVenta } from "../types/Productos/ArticuloVenta";
import { ArticuloMenu } from "../types/Productos/ArticuloMenu";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useLocation, useParams } from "react-router-dom";
import { CarritoService } from "../services/CarritoService";
import { SucursalService } from "../services/SucursalService";
import { SucursalDTO } from "../types/Restaurante/SucursalDTO";
import ModalCrud from "../components/ModalCrud";
import { getBaseUrl, getBaseUrlCliente } from "../utils/global_variables/const";
import { Promocion } from "../types/Productos/Promocion";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const Pago = () => {
    const [carrito, setCarrito] = useState<Carrito | null>(null);
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [domicilio, setDomicilio] = useState<Domicilio>();
    const [envio, setTipoEnvio] = useState<EnumTipoEnvio>(EnumTipoEnvio.RETIRO_EN_TIENDA);
    const [isVisible, setIsVisible] = useState(false);
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [modalBusquedaDomicilio, setModalBusquedaDomicilio] = useState<boolean>(false);

    // Con esto podemos verificar si el pedido vuelve luego de un fallo en mercadopago para eliminarlo
    let query = useQuery();

    const preference = query.get('preference_id');

    useEffect(() => {
        // Preference que se capta en caso de ser un pago fallido, el cual vuelve acá. Por lo tanto borramos el pedido que no se va a realizar
        if (preference && preference.length > 0) {
            PedidoService.eliminarPedidoFallido(preference);
            setPreferenceId('');
        }
    }, [preference]);

    const { id } = useParams()

    const [sucursal, setSucursal] = useState<SucursalDTO>(new SucursalDTO());

    useEffect(() => {
        if (id)
            SucursalService.getSucursalDTOById(parseInt(id))
                .then(async sucursal => {
                    if (sucursal) {
                        setSucursal(sucursal);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
    }, [id]);


    const handleModalClose = () => {
        setModalBusquedaDomicilio(false)
    };

    useEffect(() => {
        if (preferenceId) {
            initMercadoPago("TEST-7ade0306-4207-4389-a493-99007cce038d", {
                locale: "es-AR",
            });

            if (preferenceId && preferenceId !== "") {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        }

    }, [preferenceId]);

    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        const clienteString = localStorage.getItem('usuario');
        let clienteMem: Cliente = clienteString ? JSON.parse(clienteString) : new Cliente();

        setCliente(clienteMem);
    }

    useEffect(() => {
        cargarPedido();
    }, [carrito]);

    async function cargarPedido() {
        setCarrito(await CarritoService.getCarrito());
    }

    const [isLoading, setIsLoading] = useState(false);

    async function enviarPedidoARestaurante() {
        setIsLoading(true);
        const now = new Date();
        const horaActual = now.toTimeString().slice(0, 5);

        if (true) {
            if (true) {
                let hayStock = true;
                let productoFaltante: ArticuloMenu | ArticuloVenta | null = null;

                // Verificar stock de ArticuloMenu
                if (carrito?.articuloMenu) {
                    for (const producto of carrito.articuloMenu) {
                        for (const ingrediente of producto.ingredientesMenu) {
                            console.log(ingrediente)

                            hayStock = await StockIngredientesService.checkStock(ingrediente.id, ingrediente.medida.id, ingrediente.cantidad);

                            if (!hayStock) {
                                productoFaltante = producto;
                                break;
                            }
                        }
                    }
                }
                // Verificar stock de ArticuloVenta
                if (hayStock && carrito?.articuloVenta) {
                    for (const articulo of carrito.articuloVenta) {
                        hayStock = await StockArticuloVentaService.checkStock(articulo.id, articulo.cantidad);
                        if (!hayStock) {
                            productoFaltante = articulo;
                            break;
                        }
                    }
                }

                if (carrito?.promociones) {
                    for (const promocion of carrito.promociones) {
                        for (const detalle of promocion.detallesPromocion) {
                            if (detalle.articuloMenu)
                                for (const ingrediente of detalle.articuloMenu?.ingredientesMenu) {
                                    hayStock = await StockIngredientesService.checkStock(ingrediente.id, ingrediente.medida.id, ingrediente.cantidad);

                                    if (!hayStock) {
                                        productoFaltante = detalle.articuloMenu;
                                        break;
                                    }
                                }
                        }
                        if (!hayStock) break;
                    }
                }

                if (cliente && cliente?.email?.length > 0) {
                    if (hayStock) {
                        let pedido = new Pedido();
                        if (cliente) pedido.cliente = cliente;
                        pedido.tipoEnvio = envio;

                        let detalles: DetallesPedido[] = [];

                        carrito?.articuloMenu?.forEach(producto => {
                            let detalle = new DetallesPedido();
                            detalle.articuloMenu = producto;
                            detalle.cantidad = producto.cantidad;
                            detalle.subTotal = producto.cantidad * producto.precioVenta;
                            detalles.push(detalle);
                        });

                        carrito?.articuloVenta?.forEach(producto => {
                            let detalle = new DetallesPedido();
                            detalle.articuloVenta = producto;
                            detalle.cantidad = producto.cantidad;
                            detalle.subTotal = producto.cantidad * producto.precioVenta;
                            detalles.push(detalle);
                        });

                        carrito?.promociones?.forEach(promocion => {
                            let detalle = new DetallesPedido();
                            detalle.promocion = promocion;
                            detalle.cantidad = promocion.cantidad;
                            detalle.subTotal = promocion.cantidad * (promocion.precio - (1 * (promocion.descuento + 10) / 100));
                            detalles.push(detalle);
                        });

                        pedido.factura = null;
                        pedido.detallesPedido = detalles;
                        pedido.estado = EnumEstadoPedido.ENTRANTES;
                        pedido.borrado = 'NO';

                        if (envio === EnumTipoEnvio.RETIRO_EN_TIENDA) {
                            pedido.domicilioEntrega = null;
                        }

                        if (preferenceId && preferenceId.length > 0) {
                            PedidoService.eliminarPedidoFallido(preferenceId);
                        }

                        toast.promise(PedidoService.crearPedido(pedido), {
                            loading: 'Creando pedido...',
                            success: (message) => {
                                actualizarPedidos();
                                setTimeout(() => {
                                    toast.info('Dirigiéndose a pedidos...')
                                    CarritoService.limpiarCarrito();
                                    window.location.href = getBaseUrlCliente() + `/cliente/opciones/${1}`
                                }, 3000);
                                return message;
                            },
                            error: (message) => {
                                return message;
                            },
                            finally: () => {
                                setIsLoading(false);
                            }
                        });


                    } else {
                        toast.error('Lo sentimos, no hay suficiente stock de: ' + (productoFaltante?.nombre ?? 'producto desconocido'));
                        setIsLoading(false);
                    }
                } else {
                    toast.error('Debe estar logueado para realizar su pedido');
                    setIsLoading(false);
                }
            } else {
                toast.info(`El local está cerrado, el horario de atención es entre las ${sucursal.horarioApertura} y las ${sucursal.horarioCierre}`);
                setIsLoading(false);
            }
        }
        setIsLoading(false);
    }

    async function crearPreferencia(domicilio: Domicilio) {
        const now = new Date();
        const horaActual = now.toTimeString().slice(0, 5);
        setIsLoading(true);

        if (true) {
            if (true) {
                if (envio === 0) {
                    let hayStock = true;
                    let productoFaltante: ArticuloMenu | ArticuloVenta | null = null;

                    // Verificar stock de ArticuloMenu
                    if (carrito?.articuloMenu) {
                        for (const producto of carrito.articuloMenu) {
                            for (const ingrediente of producto.ingredientesMenu) {
                                hayStock = await StockIngredientesService.checkStock(ingrediente.id, ingrediente.medida.id, producto.cantidad);

                                if (!hayStock) {
                                    productoFaltante = producto;
                                    break;
                                }
                            }
                            if (!hayStock) break;
                        }
                    }

                    // Verificar stock de ArticuloVenta
                    if (hayStock && carrito?.articuloVenta) {
                        for (const articulo of carrito.articuloVenta) {
                            hayStock = await StockArticuloVentaService.checkStock(articulo.id, articulo.cantidad);

                            if (!hayStock) {
                                productoFaltante = articulo;
                                break;
                            }
                        }
                    }

                    if (cliente && cliente?.email?.length > 0) {
                        if (hayStock) {
                            if (preferenceId === null && domicilio) {
                                let pedido = new Pedido();
                                if (cliente) pedido.cliente = cliente;
                                pedido.tipoEnvio = envio;

                                let detalles: DetallesPedido[] = [];

                                carrito?.articuloMenu?.forEach(producto => {
                                    let detalle = new DetallesPedido();
                                    detalle.articuloMenu = producto;
                                    detalle.cantidad = producto.cantidad;
                                    detalle.subTotal = producto.cantidad * producto.precioVenta;
                                    detalles.push(detalle);
                                });

                                carrito?.articuloVenta?.forEach(producto => {
                                    let detalle = new DetallesPedido();
                                    detalle.articuloVenta = producto;
                                    detalle.cantidad = producto.cantidad;
                                    detalle.subTotal = producto.cantidad * producto.precioVenta;
                                    detalles.push(detalle);
                                });

                                carrito?.promociones?.forEach(promocion => {
                                    let detalle = new DetallesPedido();
                                    detalle.promocion = promocion;
                                    detalle.cantidad = promocion.cantidad;
                                    detalle.subTotal = promocion.cantidad * (promocion.precio - (1 * (promocion.descuento + 10) / 100));
                                    detalles.push(detalle);
                                });

                                pedido.factura = null;
                                pedido.detallesPedido = detalles;
                                pedido.borrado = 'NO';

                                pedido.domicilioEntrega = domicilio;

                                const horaActual = new Date();

                                // Colocar un temporizador de 5 minutos para el pago, sino se devuelve el stock
                                horaActual.setMinutes(horaActual.getMinutes() + 5);

                                // Obtener horas y minutos de la hora estimada de finalización
                                const horaFinalizacion = horaActual.getHours();

                                const minutosFinalizacion = horaActual.getMinutes();

                                // Formatear la hora estimada de finalización como una cadena HH:MM
                                const horaFinalizacionFormateada = `${horaFinalizacion.toString().padStart(2, '0')}:${minutosFinalizacion.toString().padStart(2, '0')}`;

                                // Asignar la hora de cancelacion del pedido en caso que no se pague
                                pedido.horaFinalizacion = horaFinalizacionFormateada;
                                console.log(pedido)
                                let preference = await PedidoService.crearPedidoMercadopago(pedido);
                                // Si el restaurante bloquea al usuario siempre va a retornar 0
                                if (preference.id === "0") {
                                    toast.error('Tu cuenta ha sido bloqueada por el restaurante')
                                } else {
                                    // Sumamos un pedido al actual de la hora
                                    actualizarPedidos();
                                    setPreferenceId(preference.id);
                                }
                            } else {
                                setPreferenceId(preferenceId);
                            }
                            setIsLoading(false);

                        } else {
                            toast.error('Lo sentimos, no hay suficiente stock de: ' + (productoFaltante?.nombre ?? 'producto desconocido'));
                            setIsLoading(false);
                        }
                    } else {
                        toast.error('Debe estar logueado para realizar su pedido');
                        setIsLoading(false);
                    }
                }
            } else {
                toast.info(`El local está cerrado, el horario de atención es entre las ${sucursal.horarioApertura} y las ${sucursal.horarioCierre}`);
                setIsLoading(false);
            }
        }
        setIsLoading(false);
    }

    function verificarPedidos(): boolean {
        const pedidosString = localStorage.getItem('ultimoPedidoGuardado');
        const nowTimestamp = new Date().getTime();

        if (pedidosString) {
            let pedido;

            try {
                pedido = JSON.parse(pedidosString);
            } catch (e) {
                pedido = { cantidadPedidosHoy: 0, ultimoPedido: nowTimestamp };
            }

            const hora = 3600000;

            if (nowTimestamp - pedido.ultimoPedido < hora && pedido.cantidadPedidosHoy >= 3) {
                toast('Alcanzaste el límite de 3 pedidos por hora.');
                return false;
            }
        }

        return true;
    }

    function actualizarPedidos() {
        let pedidosString = localStorage.getItem('ultimoPedidoGuardado');
        const now = new Date();
        const nowTimestamp = now.getTime();

        if (pedidosString) {
            let pedido;

            try {
                pedido = JSON.parse(pedidosString);
            } catch (e) {
                // En caso de que no sea un objeto, inicializamos uno nuevo
                pedido = { cantidadPedidosHoy: 0, ultimoPedido: nowTimestamp };
            }

            const hora = 3600000; // milisegundos en una hora

            // Verifica si la fecha guardada es hoy
            if (nowTimestamp - pedido.ultimoPedido < hora) {
                if (pedido.cantidadPedidosHoy >= 3) {
                    toast('Alcanzaste el límite de 3 pedidos por hora.');
                    return false;
                } else {
                    pedido.cantidadPedidosHoy += 1;
                }
            } else {
                // Si ha pasado más de una hora, reinicia el conteo
                pedido.cantidadPedidosHoy = 1;
            }

            pedido.ultimoPedido = nowTimestamp;
            localStorage.setItem('ultimoPedidoGuardado', JSON.stringify(pedido));
        } else {
            const pedido = {
                cantidadPedidosHoy: 1,
                ultimoPedido: nowTimestamp
            };
            localStorage.setItem('ultimoPedidoGuardado', JSON.stringify(pedido));
        }
    }



    useEffect(() => {
        document.title = 'Detalle del pedido y pago';
    }, []);

    const [showExitModal, setShowExitModal] = useState(false);
    /*
        useEffect(() => {
            const handleBeforeUnload = (event: { preventDefault: () => void; returnValue: string; }) => {
                event.preventDefault();
                event.returnValue = ''; // Este mensaje no se muestra en todos los navegadores
                setShowExitModal(true);
                return '';
            };
    
            window.addEventListener('beforeunload', handleBeforeUnload);
    
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }, [carrito]);
    */
    const handleExitConfirm = () => {
        setShowExitModal(false);
        window.location.href = getBaseUrl();
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    const handleCheckout = () => {
        const checkoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?preference_id=${preferenceId}`;
        window.location.href = checkoutUrl;
    };

    function calcularTotal(promocion: Promocion, descuentoAdicional: number) {
        let nuevoTotal = 0;
        promocion.detallesPromocion.forEach(detalle => {
            if (detalle.articuloVenta && detalle.articuloVenta.precioVenta > 0) {
                nuevoTotal += (detalle.cantidad * promocion.cantidad) * (detalle.articuloVenta.precioVenta * (1 - promocion.descuento / 100));

            } else if (detalle.articuloMenu && detalle.articuloMenu.precioVenta > 0) {
                nuevoTotal += detalle.cantidad * promocion.cantidad * (detalle.articuloMenu.precioVenta * (1 - promocion.descuento / 100));
            }
        });

        nuevoTotal = nuevoTotal * descuentoAdicional;;

        return nuevoTotal.toLocaleString('es-AR');
    }

    return (
        <>
            <Header />
            <div className="container-pago">
                <Toaster />
                <div className="div-pago">

                    <h3>&mdash; Detalle del pedido y pago &mdash;</h3>
                    <div id="detalle-producto"></div>
                    <label style={{ fontWeight: 'bold', color: '#2C2C2C', fontSize: '18px' }}>Tipo de entrega:</label>
                    <select className="tipo-envio" value={envio} name="tipoEnvio" id="tipoEnvio" onChange={e => setTipoEnvio(parseInt(e.target.value))}>
                        <option value={EnumTipoEnvio.DELIVERY}>Delivery</option>
                        <option value={EnumTipoEnvio.RETIRO_EN_TIENDA}>Retiro en tienda</option>
                    </select>
                    <hr />
                    <label style={{ fontWeight: 'bold', color: '#2C2C2C', fontSize: '18px' }}>Domicilio a entregar:</label>
                    {envio === EnumTipoEnvio.DELIVERY && (
                        <>
                            <InputComponent placeHolder='Seleccionar domicilio...' onInputClick={() => setModalBusquedaDomicilio(true)} selectedProduct={domicilio?.calle ?? ''} disabled={false} />
                            {modalBusquedaDomicilio && <ModalFlotanteRecomendacionesDomicilios datosOmitidos={domicilio?.calle ?? ''} onCloseModal={handleModalClose} onSelectedDomicilio={(domicilio) => { setDomicilio(domicilio); handleModalClose(); crearPreferencia(domicilio) }} cliente={cliente} />}

                        </>
                    )}
                    <hr />
                    <label style={{ fontWeight: 'bold', color: '#2C2C2C', fontSize: '18px' }}>Detalles del pedido:</label>


                    <div className="productos">
                        {carrito && carrito.articuloMenu.map((producto, index) => (
                            <div className="item-pago" key={index}>
                                {producto?.imagenes[0] && (
                                    <img src={producto?.imagenes[0]?.ruta} alt={producto?.nombre} />
                                )}
                                <p className="name-product">{producto.nombre}</p>
                                <div className="cant-sub">
                                    <p className="cant-product"><strong>Cantidad:</strong> {carrito.articuloMenu[index].cantidad}</p>
                                    {envio === EnumTipoEnvio.RETIRO_EN_TIENDA ? (
                                        <p className="subtotal-product"><strong>Subtotal:</strong> ${carrito.articuloMenu[index].cantidad * (carrito.articuloMenu[index].precioVenta * 0.9)}</p>
                                    ) : (
                                        <p className="subtotal-product"><strong>Subtotal:</strong> ${carrito.articuloMenu[index].cantidad * carrito.articuloMenu[index].precioVenta}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {carrito && carrito.articuloVenta.map((producto, index) => (
                            <div className="item-pago" key={index}>
                                {producto?.imagenes[0] && (
                                    <img src={producto?.imagenes[0]?.ruta} alt={producto?.nombre} />
                                )}
                                <p className="name-product">{producto.nombre}</p>
                                <div className="cant-sub">
                                    <p className="cant-product"><strong>Cantidad:</strong> {carrito.articuloVenta[index].cantidad}</p>
                                    {envio === EnumTipoEnvio.RETIRO_EN_TIENDA ? (
                                        <p className="subtotal-product"><strong>Subtotal:</strong> ${carrito.articuloVenta[index].cantidad * (carrito.articuloVenta[index].precioVenta * 0.9)}</p>
                                    ) : (
                                        <p className="subtotal-product"><strong>Subtotal:</strong> ${carrito.articuloVenta[index].cantidad * carrito.articuloVenta[index].precioVenta}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {carrito && carrito.promociones.map((producto, index) => (
                            <div className="item-pago" key={index}>
                                {producto?.imagenes[0] && (
                                    <img src={producto?.imagenes[0]?.ruta} alt={producto?.nombre} />
                                )}
                                <p className="name-product">{producto.nombre}</p>
                                <div className="cant-sub">
                                    <p className="cant-product"><strong>Cantidad:</strong> {carrito.promociones[index].cantidad}</p>
                                    {envio === EnumTipoEnvio.RETIRO_EN_TIENDA ? (
                                        <p className="subtotal-product"><strong>Subtotal:</strong> ${calcularTotal(producto, 0.9)}</p>
                                    ) : (
                                        <p className="subtotal-product"><strong>Subtotal:</strong> ${calcularTotal(producto, 1)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        <hr />
                    </div>


                    {envio === EnumTipoEnvio.DELIVERY ? (
                        <div className="total">
                            <h2><strong>Total:</strong> ${carrito?.totalPrecio}</h2>

                            {domicilio && domicilio?.calle?.length > 0 ? (
                                <>
                                    {preferenceId && preferenceId.length > 2 && (
                                        <button className="checkout-btn">
                                            <button className="checkout-btn" onClick={handleCheckout}>
                                                Pagar con Mercado Pago
                                            </button>
                                            <Wallet
                                                initialization={{ preferenceId: preferenceId, redirectMode: "blank" }}
                                                customization={{ texts: { valueProp: "smart_option" } }}
                                            />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>El botón de pago se mostrará una vez que se asigne un domicilio de entrega</p>
                            )}
                            <div className="btn-cancelar-pedido">
                                <button
                                    type="submit"
                                    className="cancelar-btn"
                                    onClick={() => { CarritoService.limpiarCarrito(); window.location.href = getBaseUrl() }}
                                >
                                    Cancelar pedido
                                </button>
                            </div>

                        </div>

                    ) : (
                        <div className="total">
                            {carrito?.totalPrecio && (
                                <h2><strong>Total:</strong> ${Math.ceil(carrito.totalPrecio * 0.9)}</h2>
                            )}
                            <p style={{ color: '#007bff' }}>*Retiro en tienda con 10% de descuento</p>
                            <button className='checkout-btn' onClick={enviarPedidoARestaurante} disabled={isLoading}>
                                {isLoading ? 'Cargando...' : 'Realizar encargo ✓'}
                            </button>
                            <button
                                type="submit"
                                className="cancelar-btn"
                                onClick={() => { CarritoService.limpiarCarrito(); window.location.href = getBaseUrl() }}
                            >
                                Cancelar pedido
                            </button>
                        </div>
                    )}
                </div>
            </div >
            <Footer sucursal={sucursal} />
            {/* Modal de confirmación de salida */}
            {showExitModal && (
                <ModalCrud
                    isOpen={showExitModal}
                    onClose={handleExitCancel}
                >

                    <div className="modal-info">
                        <h2>Si sales ahora, perderás todos los productos agregados al carrito. ¿Deseas continuar?</h2>
                        <button onClick={handleExitConfirm}>Sí, salir</button>
                        <br />
                        <br />
                        <button onClick={handleExitCancel}>No, quedarse</button>
                    </div>
                </ModalCrud>
            )}
        </>
    )
}

export default Pago;

