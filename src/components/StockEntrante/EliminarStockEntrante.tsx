import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StockEntrante } from '../../types/Stock/StockEntrante';
import { StockEntranteService } from '../../services/StockEntranteService';
import { toast, Toaster } from 'sonner';

interface EliminarStockProps {
  stockEntrante: StockEntrante;
}

const EliminarStockEntrante: React.FC<EliminarStockProps> = ({ stockEntrante }) => {
  const navigate = useNavigate();

  const onConfirm = () => {
    toast.promise(StockEntranteService.updateStock(stockEntrante), {
      loading: 'Eliminando stock entrante...',
      success: (message) => {
        navigate('/opciones');
        return message;
      },
      error: (message) => {
        return message;
      },
    });
  };

  const onCancel = () => {
    navigate('/opciones');
  };

  return (
    <div className="modal-info">
      <Toaster />
      <p>¿Seguro que quieres eliminar el stock?</p>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
}

export default EliminarStockEntrante;
