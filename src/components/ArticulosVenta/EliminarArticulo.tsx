import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticuloVentaService } from '../../services/ArticuloVentaService';
import { Toaster, toast } from 'sonner'
import { ArticuloVenta } from '../../types/Productos/ArticuloVenta';

interface EliminarArticuloProps {
  articuloOriginal: ArticuloVenta;
}

const EliminarArticuloVenta: React.FC<EliminarArticuloProps> = ({ articuloOriginal }) => {
  const navigate = useNavigate();

  const onConfirm = () => {
    toast.promise(ArticuloVentaService.updateBorradoArticulo(articuloOriginal), {
      loading: 'Eliminando articulo...',
      success: (message) => {
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
      <p>¿Seguro que quieres eliminar el articulo?</p>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
}

export default EliminarArticuloVenta;
