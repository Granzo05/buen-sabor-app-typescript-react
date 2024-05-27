import { useState } from 'react';
import { ArticuloVenta } from '../../types/Productos/ArticuloVenta';
import { toast, Toaster } from 'sonner';
import InputComponent from '../InputFiltroComponent';
import '../../styles/modalCrud.css'
import ModalFlotanteRecomendacionesMedidas from '../../hooks/ModalFlotanteFiltroMedidas';
import ModalFlotanteRecomendacionesArticulo from '../../hooks/ModalFlotanteFiltroArticuloVenta';
import AgregarMedida from '../Medidas/AgregarMedida';
import ModalFlotante from '../ModalFlotante';
import { ArticuloMenu } from '../../types/Productos/ArticuloMenu';
import { DetallePromocion } from '../../types/Productos/DetallePromocion';
import { Medida } from '../../types/Ingredientes/Medida';
import { Promocion } from '../../types/Productos/Promocion';
import { PromocionService } from '../../services/PromocionService';
import ModalFlotanteRecomendacionesArticuloMenu from '../../hooks/ModalFlotanteFiltroArticuloMenu';
import { Imagenes } from '../../types/Productos/Imagenes';

function AgregarStockEntrante() {

  const [fechaDesde, setFechaDesde] = useState(new Date());
  const [fechaHasta, setFechaHasta] = useState(new Date());
  const [total, setTotal] = useState(0);
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');

  // Aca almaceno los detalles para el stock
  const [detallesArticuloMenu, setDetallesArticulosMenu] = useState<DetallePromocion[]>([])
  const [detallesArticuloVenta, setDetallesArticuloVenta] = useState<DetallePromocion[]>([])

  const [imagenes, setImagenes] = useState<Imagenes[]>([]);
  let [selectIndexImagenes, setSelectIndexImagenes] = useState<number>(0);

  const handleImagen = (index: number, file: File | null) => {
    if (file) {
      const newImagenes = [...imagenes];
      newImagenes[index] = { ...newImagenes[index], file };
      setImagenes(newImagenes);
    }
  };

  const añadirCampoImagen = () => {
    setImagenes([...imagenes, { index: imagenes.length, file: null } as Imagenes]);
  };

  const quitarCampoImagen = () => {
    if (imagenes.length > 0) {
      const nuevasImagenes = [...imagenes];
      nuevasImagenes.pop();
      setImagenes(nuevasImagenes);

      if (selectIndexImagenes > 0) {
        setSelectIndexImagenes(prevIndex => prevIndex - 1);
      }
    } else {
      const nuevasImagenes = [...imagenes];
      nuevasImagenes.pop();
      setImagenes(nuevasImagenes);
      setSelectIndexImagenes(0);
    }
  };

  // Almacenaje de cada detalle por articuloMenu
  const handleArticuloMenuChange = (articuloMenu: ArticuloMenu, index: number) => {
    setDetallesArticulosMenu(prevState => {
      const newState = [...prevState];
      newState[index].articuloMenu = articuloMenu;
      return newState;
    });
  };

  const handleCantidadArticuloMenu = (cantidad: number, index: number) => {
    if (cantidad) {
      setDetallesArticulosMenu(prevState => {
        const newState = [...prevState];
        newState[index].cantidad = cantidad;
        return newState;
      });
    }
  };

  const handleMedidaArticuloMenu = (medida: Medida, index: number) => {
    if (medida) {
      setDetallesArticulosMenu(prevState => {
        const newState = [...prevState];
        newState[index].medida = medida;
        return newState;
      });
    }
  };

  const handleArticuloChange = (articulo: ArticuloVenta, index: number) => {
    setDetallesArticuloVenta(prevState => {
      const newState = [...prevState];
      newState[index].articuloVenta = articulo;
      return newState;
    });
  };

  const handleCantidadArticulo = (cantidad: number, index: number) => {
    if (cantidad) {
      setDetallesArticuloVenta(prevState => {
        const newState = [...prevState];
        newState[index].cantidad = cantidad;
        return newState;
      });
    }
  };

  const handleMedidaArticulo = (medida: Medida, index: number) => {
    if (medida) {
      setDetallesArticuloVenta(prevState => {
        const newState = [...prevState];
        newState[index].medida = medida;
        return newState;
      });
    }
  };

  const añadirCampoArticuloMenu = () => {
    setDetallesArticulosMenu(prevState => {
      const newState = [...prevState, { id: 0, cantidad: 0, costoUnitario: 0, subtotal: 0, medida: new Medida(), articuloMenu: new ArticuloMenu(), articuloVenta: new ArticuloVenta(), stockEntrante: null, borrado: 'NO' }];
      return newState;
    });
  };

  const añadirCampoArticulo = () => {
    setDetallesArticuloVenta(prevState => {
      const newState = [...prevState, { id: 0, cantidad: 0, costoUnitario: 0, subtotal: 0, medida: new Medida(), articuloMenu: new ArticuloMenu(), articuloVenta: new ArticuloVenta(), stockEntrante: null, borrado: 'NO' }];
      return newState;
    });
  };

  const quitarCampoArticuloMenu = () => {
    setDetallesArticulosMenu(prevState => {
      const newState = prevState.slice(0, -1);
      return newState;
    });
  };

  const quitarCampoArticulo = () => {
    setDetallesArticuloVenta(prevState => {
      const newState = prevState.slice(0, -1);
      return newState;
    });
  };

  const [modalBusquedaMedida, setModalBusquedaMedida] = useState<boolean>(false);
  const [modalBusquedaArticulo, setModalBusquedaArticulo] = useState<boolean>(false);
  const [modalBusquedaArticuloMenu, setModalBusquedaArticuloMenu] = useState<boolean>(false);
  const [showAgregarMedidaModal, setShowAgregarMedidaModal] = useState<boolean>(false);


  const handleModalClose = () => {
    setModalBusquedaMedida(false)
    setModalBusquedaArticulo(false)
    setModalBusquedaArticuloMenu(false)
    setShowAgregarMedidaModal(false)
  };

  async function agregarStockEntrante() {
    const hoy = new Date();

    if (!fechaDesde) {
      toast.error("Por favor, la fecha de inicio es necesaria");
      return;
    } else if (!fechaHasta) {
      toast.error("Por favor, la fecha de finalización es necesaria");
      return;
    } else if (new Date(fechaDesde) <= hoy || new Date(fechaHasta) <= hoy) {
      toast.error("Por favor, las fechas debe ser posterior a la fecha actual");
      return;
    } else if (new Date(fechaHasta) <= new Date(fechaDesde)) {
      toast.error("Por favor, las fecha de inicio no puede ser posterior a la de finalización");
      return;
    } else if ((!detallesArticuloMenu[0].articuloMenu?.nombre.length && !detallesArticuloVenta[0].articuloVenta?.nombre)) {
      toast.error("Por favor, es necesario asignar un producto de venta o un menú");
      return;
    } else if (imagenes.length === 0) {
      toast.error("No se asignó ninguna imagen");
      return;
    } else if (!total) {
      toast.error("Por favor, es necesario el precio");
      return;
    } else if (!descripcion) {
      toast.error("Por favor, es necesaria la descripción");
      return;
    }

    const promocion: Promocion = new Promocion();

    promocion.fechaDesde = fechaDesde;
    promocion.fechaHasta = fechaHasta;

    promocion.borrado = 'NO';

    const detallesPromocion: DetallePromocion[] = [];

    detallesArticuloMenu.forEach(detalle => {
      if (detalle.articuloMenu?.nombre && detalle.articuloMenu?.nombre.length > 2) detallesPromocion.push(detalle);
    });

    detallesArticuloVenta.forEach(detalle => {
      if (detalle.articuloVenta?.nombre && detalle.articuloVenta?.nombre.length > 2) detallesPromocion.push(detalle);
    });

    promocion.detallesPromocion = detallesPromocion;

    promocion.precio = total;

    promocion.nombre = nombre;

    promocion.imagenes = imagenes;

    promocion.descripcion = descripcion;

    toast.promise(PromocionService.createPromocion(promocion), {
      loading: 'Creando promoción...',
      success: (message) => {
        return message;
      },
      error: (message) => {
        return message;
      },
    });
  }

  return (
    <div className="modal-info">
      <h2>Agregar promoción</h2>
      <Toaster />
      <div>
        {imagenes.map((imagen, index) => (

          <div className='inputBox' key={index}>
            <p className='cierre-ingrediente' onClick={quitarCampoImagen}>X</p>
            <input
              type="file"
              accept="image/*"
              maxLength={10048576}
              onChange={(e) => handleImagen(index, e.target.files?.[0] ?? null)}
            />
          </div>
        ))}
      </div>
      <button onClick={añadirCampoImagen}>Añadir imagen</button>
      <div className="inputBox">
        <input type="number" required={true} onChange={(e) => setNombre(e.target.value)} />
        <span>Nombre de la promoción</span>
      </div>
      <div className="inputBox">
        <input type="number" required={true} onChange={(e) => setDescripcion(e.target.value)} />
        <span>Descrición de la promoción</span>
      </div>
      <div className="inputBox">
        <input type="number" required={true} onChange={(e) => setTotal(parseFloat(e.target.value))} />
        <span>Precio ($)</span>
      </div>
      <div className="inputBox">
        <label style={{ display: 'flex', fontWeight: 'bold' }}>Fecha de inicio:</label>
        <input type="date" required={true} onChange={(e) => { setFechaDesde(new Date(e.target.value)) }} />
      </div>
      <div className="inputBox">
        <label style={{ display: 'flex', fontWeight: 'bold' }}>Fecha de finalización:</label>
        <input type="date" required={true} onChange={(e) => { setFechaHasta(new Date(e.target.value)) }} />
      </div>
      <ModalFlotante isOpen={showAgregarMedidaModal} onClose={handleModalClose}>
        <AgregarMedida />
      </ModalFlotante>
      {detallesArticuloMenu.map((articuloMenu, index) => (
        <div key={index}>
          <hr />
          <p className='cierre-articuloMenu' onClick={quitarCampoArticuloMenu}>X</p>
          <div>
            <label style={{ display: 'flex', fontWeight: 'bold' }}>Menú {index}:</label>
            <InputComponent placeHolder='Filtrar articuloMenu...' onInputClick={() => setModalBusquedaArticuloMenu(true)} selectedProduct={detallesArticuloMenu[index].articuloMenu?.nombre ?? ''} />
            {modalBusquedaArticuloMenu && <ModalFlotanteRecomendacionesArticuloMenu onCloseModal={handleModalClose} onSelectArticuloMenu={(articuloMenu) => { handleArticuloMenuChange(articuloMenu, index); handleModalClose(); }} />}
          </div>
          <br />
          <button onClick={() => setShowAgregarMedidaModal(true)}>Crear medida</button>
          <br />
          <br />
          <div className="input-filtrado">
            <InputComponent placeHolder={'Filtrar unidades de medida...'} onInputClick={() => setModalBusquedaMedida(true)} selectedProduct={detallesArticuloMenu[index]?.medida.nombre ?? ''} />
            {modalBusquedaMedida && <ModalFlotanteRecomendacionesMedidas onCloseModal={handleModalClose} onSelectMedida={(medida) => { handleMedidaArticuloMenu(medida, index); handleModalClose(); }} />}
          </div>
          <br />
          <div className="inputBox">
            <input type="number" required={true} onChange={(e) => handleCantidadArticuloMenu(parseFloat(e.target.value), index)} />
            <span>Cantidad de unidades</span>
          </div>
        </div>
      ))}

      <button onClick={añadirCampoArticuloMenu}>+ Añadir menú</button>
      <br />
      {detallesArticuloVenta.map((articulo, index) => (
        <div key={index}>
          <hr />
          <p className='cierre-articuloMenu' onClick={quitarCampoArticulo}>X</p>
          <div>
            <label style={{ display: 'flex', fontWeight: 'bold' }}>Articulo {index}:</label>
            <InputComponent placeHolder='Filtrar artículo...' onInputClick={() => setModalBusquedaArticulo(true)} selectedProduct={detallesArticuloVenta[index].articuloVenta?.nombre ?? ''} />
            {modalBusquedaArticulo && <ModalFlotanteRecomendacionesArticulo onCloseModal={handleModalClose} onSelectArticuloVenta={(articulo) => { handleArticuloChange(articulo, index); handleModalClose(); }} />}
          </div>
          <br />
          <button onClick={() => setShowAgregarMedidaModal(true)}>Crear medida</button>
          <br />
          <br />
          <div className="input-filtrado">
            <InputComponent placeHolder={'Filtrar unidades de medida...'} onInputClick={() => setModalBusquedaMedida(true)} selectedProduct={detallesArticuloVenta[index]?.medida.nombre ?? ''} />
            {modalBusquedaMedida && <ModalFlotanteRecomendacionesMedidas onCloseModal={handleModalClose} onSelectMedida={(medida) => { handleMedidaArticulo(medida, index); handleModalClose(); }} />}
          </div>
          <br />
          <br />
          <button onClick={() => setShowAgregarMedidaModal(true)}>Crear medida</button>
          <div className="inputBox">
            <input type="number" required={true} onChange={(e) => handleCantidadArticulo(parseFloat(e.target.value), index)} />
            <span>Cantidad de unidades</span>
          </div>
        </div>
      ))}
      <button onClick={añadirCampoArticulo}>+ Añadir artículo</button>
      <hr />
      <button type="button" onClick={agregarStockEntrante}>Agregar stock entrante</button>
    </div >
  )
}

export default AgregarStockEntrante