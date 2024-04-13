import { useState } from 'react';
import { IngredienteMenu } from '../../types/IngredienteMenu';
import { Menu } from '../../types/Menu';
import { MenuService } from '../../services/MenuService';
import ModalFlotante from '../ModalFlotante';
import AgregarStock from '../Stock/AgregarStock';
import { IngredienteService } from '../../services/IngredienteService';
import { Imagen } from '../../types/Imagen';
import { Ingrediente } from '../../types/Ingrediente';

interface EditarMenuProps {
  menuOriginal: Menu;
}

const EditarMenu: React.FC<EditarMenuProps> = ({ menuOriginal }) => {
  const [ingredientes, setIngredientes] = useState<IngredienteMenu[]>([]);
  const [ingredientesSelect, setIngredientesSelect] = useState<Ingrediente[]>([]);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [selectIndex, setSelectIndex] = useState<number>(0);

  function cargarSelectsIngredientes() {
    IngredienteService.getIngredientes()
      .then(data => {
        setIngredientesSelect(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  const handleImagen = (index: number, file: File | null) => {
    if (file) {
      const newImagenes = [...imagenes];
      newImagenes[index] = { ...newImagenes[index], file };
      setImagenes(newImagenes);
    }
  };

  const añadirCampoImagen = () => {
    setImagenes([...imagenes, { index: imagenes.length, file: null }]);
  };

  ///////// INGREDIENTES

  const handleNombreIngredienteChange = (index: number, nombre: string) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes[index].ingrediente.nombre = nombre;
    setIngredientes(nuevosIngredientes);
  };

  const handleCantidadIngredienteChange = (index: number, cantidad: number) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes[index].cantidad = cantidad;
    setIngredientes(nuevosIngredientes);
  };

  const handleMedidaIngredienteChange = (index: number, medida: string) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes[index].ingrediente.medida = medida;
    setIngredientes(nuevosIngredientes);
  };

  const añadirCampoIngrediente = () => {
    setIngredientes([...ingredientes, { ingrediente: new Ingrediente(), cantidad: 0 }]);
    setSelectIndex(prevIndex => prevIndex + 1);
    cargarSelectsIngredientes();
  };

  const quitarCampoIngrediente = () => {
    if (ingredientes.length > 0) {
      const nuevosIngredientes = [...ingredientes];
      nuevosIngredientes.pop();
      setIngredientes(nuevosIngredientes);

      if (selectIndex > 0) {
        setSelectIndex(prevIndex => prevIndex - 1);
      }
    }
  };

    // Modal flotante de ingrediente
    const [showAgregarStockModal, setShowAgregarStockModal] = useState(false);

    const handleAgregarStock = () => {
      setShowAgregarStockModal(true);
    };
  
    const handleModalClose = () => {
      setShowAgregarStockModal(false);
      cargarSelectsIngredientes();
    };

  const [tiempoCoccion, setTiempo] = useState(menuOriginal.tiempoCoccion);
  const [tipo, setTipo] = useState(menuOriginal.tipo);
  const [comensales, setComensales] = useState(menuOriginal.comensales);
  const [precio, setPrecio] = useState(menuOriginal.precio);
  const [nombre, setNombre] = useState(menuOriginal.nombre);
  const [descripcion, setDescripcion] = useState(menuOriginal.descripcion);

  function editarMenu() {
    const menuActualizado: Menu = {
      ...menuOriginal,
      nombre,
      tiempoCoccion,
      tipo,
      comensales,
      precio,
      descripcion,
      ingredientesMenu: ingredientes
    };

    MenuService.updateMenu(menuActualizado, imagenes);
  }

  return (
    <div className="modal-info">
      <div id="inputs-imagenes">
        {imagenes.map((imagen, index) => (
          <div key={index}>
            <input
              type="file"
              accept="image/*"
              maxLength={10048576}
              onChange={(e) => handleImagen(index, e.target.files?.[0] ?? null)}
            />
          </div>
        ))}
        <button onClick={añadirCampoImagen}>Añadir imagen</button>
      </div>
      <label>
        <i className='bx bx-lock'></i>
        <input type="text" placeholder="Nombre del menu" id="nombreMenu" onChange={(e) => { setNombre(e.target.value) }} />
      </label>
      <br />
      <label>
        <i className='bx bx-lock'></i>
        <input type="text" placeholder="Descripción del menu" id="descripcion" onChange={(e) => { setDescripcion(e.target.value) }} />
      </label>
      <br />
      <label>
        <i className='bx bx-lock'></i>
        <input type="text" placeholder="Minutos de coccion" id="coccionMenu" onChange={(e) => { setTiempo(parseInt(e.target.value)) }} />
      </label>
      <br />
      <label>
        <select id="tipoMenu" name="tipoMenu" onChange={(e) => { setTipo(e.target.value) }}>
          <option value="hamburguesas">Hamburguesas</option>
          <option value="panchos">Panchos</option>
          <option value="empanadas">Empanadas</option>
          <option value="pizzas">Pizzas</option>
          <option value="lomos">Lomos</option>
          <option value="helados">Helado</option>
          <option value="parrilla">Parrilla</option>
          <option value="pastas">Pastas</option>
          <option value="sushi">Sushi</option>
          <option value="milanesas">Milanesas</option>
        </select>
      </label>
      <br />
      <div>
        <h2>Ingredientes</h2>
        <button onClick={() => handleAgregarStock()}>Cargar nuevo ingrediente</button>
        <ModalFlotante isOpen={showAgregarStockModal} onClose={handleModalClose}>
          <AgregarStock />
        </ModalFlotante>
        {ingredientes.map((ingredienteMenu, index) => (
          <div key={index} className='div-ingrediente-menu'>
            <select
              id={`select-ingredientes-${index}`}
              value={ingredienteMenu.ingrediente.nombre}
              onChange={(e) => handleNombreIngredienteChange(index, e.target.value)}
            >
              <option value="">Seleccionar ingrediente</option>
              {ingredientesSelect.map((ingrediente, index) => (
                <option key={index} value={ingrediente.nombre}>{ingrediente.nombre}</option>
              ))}
            </select>
            <input
              type="number"
              value={ingredienteMenu.cantidad}
              placeholder="Cantidad necesaria"
              onChange={(e) => handleCantidadIngredienteChange(index, parseFloat(e.target.value))}
            />
            <select
              id={`select-medidas-${index}`}
              value={ingredienteMenu.ingrediente.medida}
              onChange={(e) => handleMedidaIngredienteChange(index, e.target.value)}
            >
              <option value="">Seleccionar medida ingrediente</option>
              <option value="Kg">Kilogramos</option>
              <option value="Gramos">Gramos</option>
              <option value="Litros">Litros</option>
              <option value="Unidades">Unidades</option>
            </select>
            <p onClick={quitarCampoIngrediente}>X</p>
          </div>
        ))}
        <button onClick={añadirCampoIngrediente}>Añadir ingrediente</button>
      </div>
      <br />
      <label>
        <i className='bx bx-price'></i>
        <input type="number" placeholder="Precio" id="precioMenu" onChange={(e) => { setPrecio(parseFloat(e.target.value)) }} />
      </label>
      <br />
      <label>
        <i className='bx bx-price'></i>
        <input type="number" placeholder="Comensales" id="comensales" onChange={(e) => { setComensales(parseFloat(e.target.value)) }} />
      </label>
      <br />
      <input type="button" value="editarMenu" id="editarMenu" onClick={editarMenu} />
    </div >
  )
}


export default EditarMenu
