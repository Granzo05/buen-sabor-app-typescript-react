import { Menu } from '../../types/Menu'
import Carousel from 'react-bootstrap/Carousel';
import '../../styles/modalFlotante.css';
import { useState } from 'react';
import { Carrito } from '../../types/Carrito';

interface Props {
  menuActual: Menu;
}

export const DetallesMenu: React.FC<Props> = ({ menuActual }) => {
  const imagenesInvertidas = [...menuActual.imagenes].reverse();
  const [cantidadMenu, setCantidadMenu] = useState<number>(0);

  function handleAñadirCarrito(menu: Menu) {
    const carritoString = localStorage.getItem('carrito');
    let carrito: Carrito = carritoString ? JSON.parse(carritoString) : new Carrito();

    // Verificamos si el carrito es null o no está definido correctamente
    if (!(carrito instanceof Carrito)) {
      carrito = new Carrito();
    }

    carrito.menu.push(menu);
    carrito.cantidad.push(cantidadMenu);
    carrito.precio.push(menu.precio);
    carrito.imagenSrc.push(menu.imagenes[0].ruta);

    // Recalculamos el total de productos y el total de precios
    carrito.totalProductos += cantidadMenu;
    carrito.totalPrecio += menu.precio * cantidadMenu;

    localStorage.setItem('carrito', JSON.stringify(carrito));
  }


  return (
    <div id="grid-container-modal">
      <div key={menuActual.id} className="grid-item-modal">
        <Carousel>
          {imagenesInvertidas.map((imagen, index) => (
            <Carousel.Item key={index} interval={4000}>
              <img src={`http://localhost:8080/${menuActual.nombre.replace(' ', '')}/${imagen.fileName}`} alt={imagen.fileName} />
            </Carousel.Item>
          ))}
        </Carousel>
        <h2>{menuActual.nombre}</h2>
        <h2>${menuActual.precio}</h2>
        <h2>Descripción: {menuActual.descripcion}</h2>
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg"><path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z" /></svg>{menuActual.comensales}</h2>
        <h2>Ingredientes:</h2>
        <ul>
          {menuActual.ingredientesMenu.map((ingredienteMenu, index) => (
            <li key={index}>* {ingredienteMenu.ingrediente.nombre}</li>
          ))}
        </ul>
        <h2>Tiempo de cocción: {menuActual.tiempoCoccion}</h2>

        <input type="number" value={1} onChange={(e) => { setCantidadMenu(parseInt(e.target.value)) }} />
        <button onClick={() => handleAñadirCarrito(menuActual)}>Añadir al carrito</button>
      </div>
    </div>
  );

}

export default DetallesMenu;