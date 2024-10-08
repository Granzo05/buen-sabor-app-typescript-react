import React from 'react';
import { MenuService } from '../../services/MenuService';
import { toast, Toaster } from 'sonner';
import { ArticuloMenu } from '../../types/Productos/ArticuloMenu';

interface EliminarMenuProps {
  menuOriginal: ArticuloMenu;
  onCloseModal: () => void;
}

const EliminarMenu: React.FC<EliminarMenuProps> = ({ menuOriginal, onCloseModal }) => {
  const onConfirm = () => {
    menuOriginal.borrado = 'SI';
    toast.promise(MenuService.updateBorradoMenu(menuOriginal), {
      loading: 'Eliminando menú...',
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
      <h2>¿Seguro que quieres eliminar el menú?</h2>
      <button onClick={onConfirm}>Confirmar</button>
      <br />
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
}

export default EliminarMenu;
