import { useEffect, useState } from "react";
import EliminarStock from "./EliminarStock";
import EditarStock from "./EditarStock";
import '../../styles/stock.css';
import { StockIngredientesService } from "../../services/StockIngredientesService";
import { StockArticuloVentaService } from "../../services/StockArticulosService";
import AgregarStockArticulo from "./AgregarStockArticulo";
import AgregarStockIngrediente from "./AgregarStockIngrediente";
import ModalFlotante from "../ModalFlotante";
import ActivarStock from "./ActivarStock";
import ModalCrud from "../ModalCrud";
import { StockArticuloVenta } from "../../types/Stock/StockArticuloVenta";
import { StockIngredientes } from "../../types/Stock/StockIngredientes";
import { formatearFechaDDMMYYYY } from "../../utils/global_variables/functions";
import { Empleado } from "../../types/Restaurante/Empleado";
import { DESACTIVAR_PRIVILEGIOS } from "../../utils/global_variables/const";
import { Sucursal } from "../../types/Restaurante/Sucursal";
import { Ingrediente } from "../../types/Ingredientes/Ingrediente";


const Stocks = () => {
    const [stockIngredientes, setStockIngredientes] = useState<StockIngredientes[]>([]);
    const [stockArticulos, setStockArticulos] = useState<StockArticuloVenta[]>([]);
    const [mostrarStocks, setMostrarStocks] = useState(true);

    const [showAgregarStockModalIngrediente, setShowAgregarStockModalIngrediente] = useState(false);
    const [showAgregarStockModalArticulo, setShowAgregarStockModalArticulo] = useState(false);
    const [showEditarStockModal, setShowEditarStockModal] = useState(false);
    const [showEliminarStockModal, setShowEliminarStockModal] = useState(false);
    const [showActivarStockModal, setShowActivarStockModal] = useState(false);
    const [tipo, setTipo] = useState('');
    const [nombre, setNombre] = useState<string | undefined>();

    const [selectedStock, setSelectedStock] = useState<StockArticuloVenta | StockIngredientes>();

    useEffect(() => {
        getIngredientes();
        getArticulos();
    }, []);

    const getIngredientes = async () => {
        StockIngredientesService.getStock()
            .then(data => {
                setStockIngredientes(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const getArticulos = async () => {
        StockArticuloVentaService.getStock()
            .then(data => {
                setStockArticulos(data)
            })
            .catch(error => {
                console.error('Error:', error);
            });
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

    const [createVisible, setCreateVisible] = useState(DESACTIVAR_PRIVILEGIOS);
    const [updateVisible, setUpdateVisible] = useState(DESACTIVAR_PRIVILEGIOS);
    const [deleteVisible, setDeleteVisible] = useState(DESACTIVAR_PRIVILEGIOS);
    const [activateVisible, setActivateVisible] = useState(DESACTIVAR_PRIVILEGIOS);


    const stocks = [...stockArticulos, ...stockIngredientes];

    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadProductosMostrables, setCantidadProductosMostrables] = useState(11);

    // Calcular el índice del primer y último elemento de la página actual
    const indexUltimoProducto = paginaActual * cantidadProductosMostrables;
    const indexPrimerProducto = indexUltimoProducto - cantidadProductosMostrables;

    // Obtener los elementos de la página actual
    const [datosFiltrados, setDatosFiltrados] = useState<StockIngredientes[]>([]);

    const [paginasTotales, setPaginasTotales] = useState<number>(1);

    // Cambiar de página
    const paginate = (numeroPagina: number) => setPaginaActual(numeroPagina);

    function cantidadDatosMostrables(cantidad: number) {
        setCantidadProductosMostrables(cantidad);

        if (cantidad > stocks.length) {
            setPaginasTotales(1);
            setDatosFiltrados(stocks);
        } else {
            setPaginasTotales(Math.ceil(stocks.length / cantidad));
            setDatosFiltrados(stocks.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }

    const [signoPrecio, setSignoPrecio] = useState('>');

    function filtrarPrecio(filtro: number) {
        const comparadores: { [key: string]: (a: number, b: number) => boolean } = {
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '=': (a, b) => a === b
        };

        if (filtro > 0 && comparadores[signoPrecio]) {
            const filtradas = stocks.filter(recomendacion =>
                comparadores[signoPrecio](recomendacion.precioCompra, filtro)
            );
            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(stocks.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(stocks.length / cantidadProductosMostrables));
        }
    }

    function filtrarStocks(filtro: string) {
        if (filtro.length > 0) {
            let filtradas = stocks.filter(recomendacion =>
                recomendacion.articuloVenta?.nombre.toLowerCase().includes(filtro.toLowerCase())
            );

            if (filtradas.length === 0) {
                filtradas = stocks.filter(recomendacion =>
                    recomendacion.ingrediente?.nombre.toLowerCase().includes(filtro.toLowerCase())
                );
            }

            setDatosFiltrados(filtradas.length > 0 ? filtradas : []);
            setPaginasTotales(Math.ceil(filtradas.length / cantidadProductosMostrables));
        } else {
            setDatosFiltrados(stocks.slice(indexPrimerProducto, indexUltimoProducto));
            setPaginasTotales(Math.ceil(stocks.length / cantidadProductosMostrables));
        }
    }

    useEffect(() => {
        if (stocks.length > 0) {
            setDatosFiltrados(stocks.slice(indexPrimerProducto, indexUltimoProducto));
        }
    }, [stocks, paginaActual, cantidadProductosMostrables]);

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

    const handleAgregarIngrediente = () => {
        setShowAgregarStockModalIngrediente(true);
        setMostrarStocks(false);
    };

    const handleAgregarArticulo = () => {
        setShowAgregarStockModalArticulo(true);
        setMostrarStocks(false);
    };

    const handleEditarStock = (stock: StockArticuloVenta | StockIngredientes) => {
        setSelectedStock(stock);
        setShowEditarStockModal(true);
        setMostrarStocks(false);
    };

    const handleEliminarStock = (stock: StockArticuloVenta | StockIngredientes) => {
        setSelectedStock(stock);
        setShowEliminarStockModal(true);
        setShowActivarStockModal(false);
        setMostrarStocks(false);
    };

    const handleActivarStock = (stock: StockArticuloVenta | StockIngredientes) => {
        setSelectedStock(stock);
        setShowEliminarStockModal(false);
        setShowActivarStockModal(true);
        setMostrarStocks(false);
    };

    const handleModalClose = () => {
        setShowAgregarStockModalArticulo(false);
        setShowAgregarStockModalIngrediente(false);
        setShowEditarStockModal(false);
        setShowEliminarStockModal(false);
        setShowActivarStockModal(false);

        setMostrarStocks(true);
        getArticulos();
        getIngredientes();
    };

    return (
        <div className="opciones-pantallas">

            <h1>- Stock -</h1>
            <div className="references-venta">
                <p><span className="cuadrado venta"></span>Artículos para venta</p>
                <p><span className="cuadrado noventa"></span>Artículos para no venta</p>

            </div>
            {createVisible && (
                <div className="btns-stock">
                    <button className="btn-agregar" onClick={() => handleAgregarIngrediente()}>+ Agregar stock ingrediente</button>
                    <button className="btn-agregar" onClick={() => handleAgregarArticulo()}>+ Agregar stock articulo</button>
                </div>)}


            <hr />

            <ModalCrud isOpen={showAgregarStockModalArticulo} onClose={handleModalClose}>
                <AgregarStockArticulo onCloseModal={handleModalClose} />
            </ModalCrud>

            <ModalCrud isOpen={showAgregarStockModalIngrediente} onClose={handleModalClose}>
                <AgregarStockIngrediente onCloseModal={handleModalClose} />
            </ModalCrud>

            <ModalCrud isOpen={showEliminarStockModal} onClose={handleModalClose}>
                {selectedStock && <EliminarStock stockOriginal={selectedStock} onCloseModal={handleModalClose} tipo={tipo} />}
            </ModalCrud>

            <ModalCrud isOpen={showActivarStockModal} onClose={handleModalClose}>
                {selectedStock && <ActivarStock stockOriginal={selectedStock} onCloseModal={handleModalClose} tipo={tipo} />}
            </ModalCrud>

            <ModalCrud isOpen={showEditarStockModal} onClose={handleModalClose}>
                {selectedStock && <EditarStock onCloseModal={handleModalClose} stockOriginal={selectedStock} tipo={tipo} nombre={nombre} />}
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
                            onChange={(e) => filtrarStocks(e.target.value)}
                        />
                        <span>Filtrar por nombre</span>
                    </div>
                    <div className="inputBox-filtrado">
                        <input
                            type="number"
                            required
                            onChange={(e) => filtrarPrecio(parseInt(e.target.value))}
                        />
                        <span>Filtrar por precio</span>
                        <select name="signo" value={signoPrecio} onChange={(e) => setSignoPrecio(e.target.value)}>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                            <option value="=">=</option>
                        </select>
                    </div>
                </div>


            </div>

            {mostrarStocks && (
                <div id="stocks">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cantidad actual</th>
                                <th>Cantidad minima</th>
                                <th>Cantidad máxima</th>
                                <th>Costo</th>
                                <th>Fecha próximo ingreso</th>
                                <th>¿Venta?</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {datosFiltrados.map(stock => (
                                <tr key={stock.id}>
                                    <td>{stock.ingrediente?.nombre}{stock.articuloVenta?.nombre}</td>
                                    <td style={{ textTransform: 'lowercase' }}>{stock.cantidadActual} {stock.medida?.nombre}</td>
                                    <td style={{ textTransform: 'lowercase' }}>{stock.cantidadMinima} {stock.medida?.nombre}</td>
                                    <td style={{ textTransform: 'lowercase' }}>{stock.cantidadMaxima} {stock.medida?.nombre}</td>
                                    <td>${stock.precioCompra}</td>
                                    <td>{stock.fechaLlegadaProxima ? (
                                        formatearFechaDDMMYYYY(new Date(stock.fechaLlegadaProxima))
                                    ) : (
                                        <p>No hay próximas entradas</p>
                                    )}
                                    </td>
                                    {stock.ingrediente && stock.ingrediente.nombre.length > 0 ? (
                                        <td style={{ backgroundColor: '#f51a1a' }}>NO</td>
                                    ) : (
                                        <td style={{ backgroundColor: '#19cc37' }}>SI</td>
                                    )}
                                    {stock.borrado === 'NO' ? (
                                        <td>
                                            <div className="btns-acciones">
                                                {updateVisible && (
                                                    <button className="btn-accion-editar" onClick={() => { handleEditarStock(stock); setTipo('ingrediente'); setNombre(stock.ingrediente?.nombre) }}>EDITAR</button>
                                                )}
                                                {deleteVisible && (
                                                    <button className="btn-accion-eliminar" onClick={() => { handleEliminarStock(stock); setTipo('ingrediente') }}>ELIMINAR</button>
                                                )}
                                            </div>
                                        </td>
                                    ) : (
                                        <td>
                                            <div className="btns-acciones">
                                                {updateVisible && (
                                                    <button className="btn-accion-editar" onClick={() => { handleEditarStock(stock); setTipo('ingrediente'); setNombre(stock.ingrediente?.nombre) }}>EDITAR</button>
                                                )}
                                                {activateVisible && (
                                                    <button className="btn-accion-activar" onClick={() => { handleActivarStock(stock); setTipo('ingrediente') }}>ACTIVAR</button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody >
                    </table >
                    <div className="pagination">
                        {Array.from({ length: paginasTotales }, (_, index) => (
                            <button key={index + 1} onClick={() => paginate(index + 1)} disabled={paginaActual === index + 1}>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div >
            )}

        </div >
    )
}

export default Stocks
