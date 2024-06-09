import { useState } from 'react';
import { Ingrediente } from '../../types/Ingredientes/Ingrediente';
import { Toaster, toast } from 'sonner'
import { IngredienteService } from '../../services/IngredienteService';

interface EditarIngredienteProps {
  ingredienteOriginal: Ingrediente;
  onCloseModal: () => void;
}

const EditarIngrediente: React.FC<EditarIngredienteProps> = ({ ingredienteOriginal, onCloseModal }) => {

  const [nombre, setNombre] = useState(ingredienteOriginal.nombre);

  function editarIngrediente() {
    const ingrediente: Ingrediente = ingredienteOriginal;
    ingrediente.borrado = 'NO';

    if (!nombre) {
      toast.info("Por favor, asigne el nombre");
      return;
    }

    ingrediente.nombre = nombre;
    toast.promise(IngredienteService.updateIngrediente(ingrediente), {
      loading: 'Editando Ingrediente...',
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

  return (
    <div className="modal-info">
      <h2>Editar ingrediente</h2>
      <Toaster />
      <div className="inputBox">
        <input type="text" required={true} value={nombre} onChange={(e) => { setNombre(e.target.value) }} />
        <span>Nombre del ingrediente</span>
      </div>
      <button onClick={editarIngrediente}>Editar ingrediente</button>
    </div>
  )
}

export default EditarIngrediente
