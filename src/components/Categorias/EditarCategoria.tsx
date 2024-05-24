import { useState } from 'react';
import { clearInputs } from '../../utils/global_variables/functions';
import { Categoria } from '../../types/Ingredientes/Categoria';
import { Toaster, toast } from 'sonner'
import { CategoriaService } from '../../services/CategoriaService';

interface EditarCategoriaProps {
  categoriaOriginal: Categoria;
}

const EditarCategoria: React.FC<EditarCategoriaProps> = ({ categoriaOriginal }) => {

  const [nombre, setNombre] = useState(categoriaOriginal.nombre);

  function editarCategoria() {
    const categoria: Categoria = categoriaOriginal;
    categoria.borrado = 'NO';

    if (!nombre) {
      toast.info("Por favor, asigne el nombre");
      return;
    }

    categoria.nombre = nombre;
    toast.promise(CategoriaService.updateCategoria(categoria), {
      loading: 'Creando Categoria...',
      success: (message) => {
        clearInputs();
        return message;
      },
      error: (message) => {
        return message;
      },
    });
  }

  return (
    <div className="modal-info">
      <h2>Editar categoria</h2>
      <Toaster />
      <div className="inputBox">
        <input type="text" required={true} value={nombre} onChange={(e) => { setNombre(e.target.value) }} />
        <span>Nombre del categoria</span>
      </div>
      <button onClick={editarCategoria}>Editar categoria</button>
    </div>
  )
}

export default EditarCategoria
