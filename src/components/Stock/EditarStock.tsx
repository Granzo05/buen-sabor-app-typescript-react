import { useState } from 'react';
import { Stock } from '../../types/Stock';
import { StockService } from '../../services/StockService';
import { Ingrediente } from '../../types/Ingrediente';

interface EditarStockProps {
  stockOriginal: Stock;
}

const EditarStock: React.FC<EditarStockProps> = ({ stockOriginal }) => {

  const [cantidad, setCantidad] = useState(0);
  const [medida, setMedida] = useState('');
  const [nombreIngrediente, setIngredienteNombre] = useState('');
  const [costoIngrediente, setCostoIngrediente] = useState(0);
  const [fechaReposicion, setFechaReposicion] = useState(new Date());

  function editarStock() {
    const stock: Stock = stockOriginal;

    const ingrediente: Ingrediente = stockOriginal.ingrediente;
    ingrediente.nombre = nombreIngrediente;
    ingrediente.costo = costoIngrediente;
    ingrediente.medida = medida;

    stock.cantidad = cantidad;
    stock.fechaIngreso = new Date(fechaReposicion.getFullYear(), fechaReposicion.getMonth(), fechaReposicion.getDate() + 1);
    stock.ingrediente = ingrediente;
    
    StockService.updateStock(stock);
  }

  return (
    <div id="miModal" className="modal">
      <div className="modal-content">
        <br />
        <label>
          <i className='bx bx-lock'></i>
          <input type="text" value={stockOriginal.ingrediente.nombre} placeholder="Nombre del ingrediente" id="nombreStock" onChange={(e) => { setIngredienteNombre(e.target.value) }} />
        </label>
        <br />
        <label>
          <i className='bx bx-lock'></i>
          <input type="text" value={stockOriginal.cantidad} placeholder="Cantidad del ingrediente" id="cantidadStock" onChange={(e) => { setCantidad(parseFloat(e.target.value)) }} />
        </label>
        <br />
        <label>
          <i className='bx bx-lock'></i>
          <select id="medidaStock" onChange={(e) => { setMedida(e.target.value) }}>
            <option value="Kg">Kilogramos</option>
            <option value="Gramos">Gramos</option>
            <option value="Litros">Litros</option>
            <option value="Unidades">Unidades</option>
            <option value="Docenas">Docenas</option>
          </select>
        </label>
        <br />
        <label>
          <i className='bx bx-lock'></i>
          <input type="text" placeholder="Costo del ingrediente" id="costoStock" onChange={(e) => { setCostoIngrediente(parseFloat(e.target.value)) }} />
        </label>
        <label>
          <i className='bx bx-lock'></i>
          <label htmlFor="fechaReposicion">Fecha de próximo stock</label>
          <input type="date" id="fechaReposicion" onChange={(e) => { setFechaReposicion(new Date(e.target.value)) }} />
        </label>
        <input type="button" value="editarStock" id="editarStock" onClick={editarStock} />
      </div>
    </div>
  )
}

export default EditarStock
