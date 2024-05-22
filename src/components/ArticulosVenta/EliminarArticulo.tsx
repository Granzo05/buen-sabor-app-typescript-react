import React from 'react';
import { ArticuloVentaService } from '../../services/ArticuloVentaService';
import { Toaster, toast } from 'sonner'
import { ArticuloVenta } from '../../types/Productos/ArticuloVenta';

interface EliminarArticuloProps {
  articuloOriginal: ArticuloVenta;
  onCloseModal: () => void;

}

const EliminarArticuloVenta: React.FC<EliminarArticuloProps> = ({ articuloOriginal, onCloseModal }) => {

  const onConfirm = () => {
    toast.promise(ArticuloVentaService.updateBorradoArticulo(articuloOriginal), {
      loading: 'Eliminando articulo...',
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
  };

  const onCancel = () => {
    onCloseModal();
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
