import Carousel from 'react-bootstrap/Carousel';
import '../../styles/modalFlotante.css';
import { useState } from 'react';
import { CarritoService } from '../../services/CarritoService';
import { Promocion } from '../../types/Productos/Promocion';
import { toast, Toaster } from 'sonner';

interface Props {
  selectedPromocion: Promocion;
  onCloseModal: () => void;
}

export const DetallesPromocion: React.FC<Props> = ({ selectedPromocion, onCloseModal }) => {
  const imagenesInvertidas = [...selectedPromocion.imagenes].reverse();
  const [cantidadPromocion, setCantidadPromocion] = useState<number>(1);

  async function handleAñadirPromocionAlCarrito(promocion: Promocion) {
    if (cantidadPromocion <= 0) {
      toast.error("Por favor, la cantidad debe ser mayor a 0");
      return;
    }

    CarritoService.agregarPromocionAlCarrito(promocion, cantidadPromocion);
    onCloseModal();
  }

  return (
    <div id="grid-container-modal">
      <Toaster />
      <div key={selectedPromocion.id} className="grid-item-modal">
        <Carousel>
          {imagenesInvertidas.map((imagen, index) => (
            <Carousel.Item key={index} interval={4000}>
              <img src={imagen.ruta} />
            </Carousel.Item>
          ))}
        </Carousel>
        <h2>{selectedPromocion.nombre}</h2>
        <p>Descripción: {selectedPromocion.descripcion}</p>
        <p>Productos:</p>
        <ul>
          {selectedPromocion.detallesPromocion?.map((detalle) => (
            <div key={detalle.id}>
              <img src={detalle.articuloMenu?.imagenes[0]?.ruta} alt="" />
              <img src={detalle.articuloVenta?.imagenes[0]?.ruta} alt="" />
              <li key={detalle.id}>* {detalle.articuloMenu?.nombre} {detalle.articuloVenta?.nombre} - {detalle.cantidad} - {detalle.medida?.nombre}</li>
            </div>
          ))}
        </ul>
        <p>Precio: ${selectedPromocion.precio}</p>

        <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '20%' }} className="inputBox">
          <label style={{ display: 'flex', fontWeight: 'bold' }}>Cantidad:</label>

          <input type="number" required={true} value={cantidadPromocion} onChange={(e) => { setCantidadPromocion(parseInt(e.target.value)) }} />

        </div>
        <button type='submit' onClick={() => handleAñadirPromocionAlCarrito(selectedPromocion)}>Añadir al carrito</button>
      </div>
    </div>
  );

}

export default DetallesPromocion;