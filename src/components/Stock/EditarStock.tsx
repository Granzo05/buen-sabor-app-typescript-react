import { useEffect, useState } from 'react';
import { StockIngredientesService } from '../../services/StockIngredientesService';
import { StockArticuloVentaService } from '../../services/StockArticulosService';
import { toast, Toaster } from 'sonner';
import '../../styles/modalFlotante.css'
import InputComponent from '../InputFiltroComponent';
import ModalFlotanteRecomendacionesMedidas from '../../hooks/ModalFlotanteFiltroMedidas';
import { StockIngredientes } from '../../types/Stock/StockIngredientes';
import { StockArticuloVenta } from '../../types/Stock/StockArticuloVenta';
import { Medida } from '../../types/Ingredientes/Medida';
import { Ingrediente } from '../../types/Ingredientes/Ingrediente';

interface EditarStockProps {
  stockOriginal: StockArticuloVenta | StockIngredientes;
  tipo: string;
  nombre: string | undefined;
  onCloseModal: () => void;
}

const EditarStock: React.FC<EditarStockProps> = ({ stockOriginal, tipo, nombre, onCloseModal }) => {

  const [cantidadActual, setCantidadActual] = useState(stockOriginal.cantidadActual);
  const [cantidadMinima, setCantidadMinima] = useState(stockOriginal.cantidadMinima);
  const [cantidadMaxima, setCantidadMaxima] = useState(stockOriginal.cantidadMaxima);
  const [medida, setMedida] = useState<Medida>();
  const [costo, setCosto] = useState(stockOriginal.precioCompra);

  const [modalBusqueda, setModalBusqueda] = useState<boolean>(false);

  const handleAbrirRecomendaciones = () => {
    setModalBusqueda(true)
  };

  const handleModalClose = () => {
    setModalBusqueda(false)
  };

  useEffect(() => {
    if (stockOriginal.medida) setMedida(stockOriginal.medida);
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  function editarStock() {
    if (!cantidadMinima || cantidadMinima < 0) {
      toast.error("Por favor, es necesaria la cantidad mínima");
      return;
    } else if (!cantidadMaxima || cantidadMaxima < 0) {
      toast.error("Por favor, es necesaria la cantidad máxima");
      return;
    } else if (!cantidadActual || cantidadActual < 0) {
      toast.error("Por favor, es necesaria la cantidad actual");
      return;
    } else if (!medida) {
      toast.error("Por favor, es necesario la medida");
      return;
    } else if (!costo || costo < 0) {
      toast.error("Por favor, es necesario el precio del ingrediente");
      return;
    } else if (cantidadMaxima < cantidadMinima) {
      toast.error("Por favor, la cantidad mínima no puede ser mayor a la máxima");
      return;
    } else if (cantidadActual > cantidadMaxima) {
      toast.error("Por favor, la cantidad actual no puede ser mayor a la maxima");
      return;
    } else if (cantidadActual < cantidadMinima) {
      toast.error("Por favor, la cantidad actual no puede ser menor a la minima");
      return;
    }
    setIsLoading(true);

    if (tipo === 'ingrediente') {
      const stock: StockIngredientes = new StockIngredientes();

      if (medida) stock.medida = medida;
      stock.id = stockOriginal.id;
      stock.cantidadActual = cantidadActual;
      stock.cantidadMinima = cantidadMinima;
      stock.cantidadMaxima = cantidadMaxima;
      stock.borrado = stockOriginal.borrado;
      stock.precioCompra = costo;
      stock.id = stockOriginal.id;
      stock.ingrediente = stockOriginal.ingrediente;

      toast.promise(StockIngredientesService.updateStock(stock), {
        loading: 'Creando stock del ingrediente...',
        success: (message) => {
          setTimeout(() => {
            onCloseModal();
          }, 800);
          return message;
        },
        error: (message) => {
          return message;
        },
      });

    } else {
      const stock: StockArticuloVenta = new StockArticuloVenta();

      if (medida) stock.medida = medida;
      stock.cantidadActual = cantidadActual;
      stock.cantidadMinima = cantidadMinima;
      stock.cantidadMaxima = cantidadMaxima;
      stock.precioCompra = costo;
      stock.id = stockOriginal.id;
      stock.borrado = 'NO';

      if (stockOriginal.articuloVenta) stock.articuloVenta = stockOriginal.articuloVenta;

      toast.promise(StockArticuloVentaService.updateStock(stock), {
        loading: 'Editando stock del artículo...',
        success: (message) => {
          setTimeout(() => {
            onCloseModal();
          }, 800);
          return message;
        },
        error: (message) => {
          return message;
        },
      });
    }

  }

  return (
    <div className="modal-info">
      <Toaster />

      <h2>&mdash; Editar stock de: {nombre} &mdash;</h2>
      <div className="inputBox">
        <input type="number" required={true} pattern="\d*" value={cantidadMinima} min={1} onChange={(e) => { setCantidadMinima(parseFloat(e.target.value)) }} />
        <span>Cantidad mínima del ingrediente</span>
        <div className="error-message">La cantidad mínima solo debe contener números y no debe ser 0.</div>

      </div>
      <div className="inputBox">
        <input type="number" required={true} pattern="\d*" value={cantidadMaxima} min={1} onChange={(e) => { setCantidadMaxima(parseFloat(e.target.value)) }} />
        <span>Cantidad máxima del ingrediente</span>
        <div className="error-message">La cantidad máxima solo debe contener números y no debe ser 0.</div>

      </div>
      <div className="inputBox">
        <input type="number" required={true} pattern="\d*" value={cantidadActual} min={1} onChange={(e) => { setCantidadActual(parseFloat(e.target.value)) }} />
        <span>Cantidad actual del ingrediente</span>
        <div className="error-message">La cantidad actual solo debe contener números y no debe ser 0.</div>

      </div>
      <div className="input-filtrado">
        <InputComponent disabled={false} placeHolder={'Filtrar unidades de medida...'} onInputClick={() => handleAbrirRecomendaciones()} selectedProduct={medida?.nombre ?? ''} />
        {modalBusqueda && <ModalFlotanteRecomendacionesMedidas datosOmitidos={medida?.nombre ?? ''} onCloseModal={handleModalClose} onSelectMedida={(medida) => { setMedida(medida); handleModalClose(); }} />}
      </div>
      <div className="inputBox">
        <input type="text" required={true} pattern="\d*" value={costo || ''} onChange={(e) => { setCosto(parseFloat(e.target.value)) }} />
        <span>Costo del ingrediente por unidad de medida ($)</span>
        <div className="error-message">El costo por unidad solo debe contener números.</div>

      </div>
      <button className='btn-accion-completar' onClick={editarStock} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Editar stock ✓'}
      </button>
    </div>
  )
}

export default EditarStock
