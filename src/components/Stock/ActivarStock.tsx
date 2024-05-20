import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StockIngredientesService } from '../../services/StockIngredientesService';
import { StockArticuloVentaService } from '../../services/StockArticulosService';
import { StockArticuloVentaDTO } from '../../types/Stock/StockArticuloVentaDTO';
import { StockIngredientesDTO } from '../../types/Stock/StockIngredientesDTO';
import { toast, Toaster } from 'sonner';
import '../../styles/modals.css'

interface ActivarStockProps {
  stockOriginal: StockArticuloVentaDTO | StockIngredientesDTO;
}

const ActivarStock: React.FC<ActivarStockProps> = ({ stockOriginal }) => {
  const navigate = useNavigate();

  const onConfirm = () => {
    if (stockOriginal.tipo === 'ingrediente') {
      toast.promise(StockIngredientesService.updateStock(stockOriginal), {
        loading: 'Activando stock del ingrediente...',
        success: (message) => {
          navigate('/opciones');
          return message;
        },
        error: (message) => {
          return message;
        },
      });
    } else {
      toast.promise(StockArticuloVentaService.updateStock(stockOriginal), {
        loading: 'Activando stock del articulo...',
        success: (message) => {
          navigate('/opciones');
          return message;
        },
        error: (message) => {
          return message;
        },
      });
    }
  };

  const onCancel = () => {
    navigate('/opciones');
  };

  return (
    <div className="modal-info">
      <Toaster />
      <h3>¿Seguro que quieres activar el stock?</h3>
      <div className="btns-eliminar-stock">
        <button onClick={onConfirm}>Confirmar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>

    </div>
  );
}

export default ActivarStock;