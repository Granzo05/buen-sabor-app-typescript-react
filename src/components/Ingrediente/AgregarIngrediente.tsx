import { SetStateAction, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner'
import { Ingrediente } from '../../types/Ingredientes/Ingrediente';
import { IngredienteService } from '../../services/IngredienteService';
import ModalFlotanteRecomendacionesMedidas from '../../hooks/ModalFlotanteFiltroMedidas';
import InputComponent from '../InputFiltroComponent';
import { StockIngredientes } from '../../types/Stock/StockIngredientes';
import { Medida } from '../../types/Ingredientes/Medida';
import { StockIngredientesService } from '../../services/StockIngredientesService';
import { SucursalService } from '../../services/SucursalService';
import { Sucursal } from '../../types/Restaurante/Sucursal';
import { Empresa } from '../../types/Restaurante/Empresa';

interface AgregarIngredienteProps {
  onCloseModal: () => void;
}

const AgregarIngrediente: React.FC<AgregarIngredienteProps> = ({ onCloseModal }) => {
  const [nombre, setNombre] = useState('');
  const [cantidadActual, setCantidadActual] = useState(0);
  const [cantidadMinima, setCantidadMinima] = useState(0);
  const [cantidadMaxima, setCantidadMaxima] = useState(0);
  const [medida, setMedida] = useState<Medida>(new Medida());
  const [costoIngrediente, setCostoIngrediente] = useState(0);
  const [modalBusquedaMedida, setModalBusquedaMedida] = useState<boolean>(false);
  const [sucursalesElegidas, setSucursalesElegidas] = useState<{ [nombre: string]: string[] }>({});

  const handleModalClose = () => {
    setModalBusquedaMedida(false)
  };

  const [empresa] = useState<Empresa | null>(() => {
    const empresaString = localStorage.getItem('empresa');

    return empresaString ? (JSON.parse(empresaString) as Empresa) : null;
  });

  const [idsSucursalesElegidas, setIdsSucursalesElegidas] = useState<Set<number>>(new Set<number>());
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  useEffect(() => {
    SucursalService.getSucursales()
      .then(data => {
        setSucursales(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleSucursalesElegidas = (sucursalId: number) => {
    const updatedSelectedSucursales = new Set(idsSucursalesElegidas);
    if (updatedSelectedSucursales.has(sucursalId)) {
      updatedSelectedSucursales.delete(sucursalId);
    } else {
      updatedSelectedSucursales.add(sucursalId);
    }
    setIdsSucursalesElegidas(updatedSelectedSucursales);
  };

  const marcarSucursales = () => {
    setIdsSucursalesElegidas(new Set(sucursales.map(sucursal => sucursal.id)));
  };

  const desmarcarSucursales = () => {
    setIdsSucursalesElegidas(new Set());
  };

  const [isLoading, setIsLoading] = useState(false);

  async function agregarIngrediente() {

    if (!nombre || !nombre.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)) {
      toast.info("Por favor, asigne un nombre válido");
      return;
    } else if (cantidadMaxima < cantidadMinima) {
      toast.error("Por favor, la cantidad mínima no puede ser mayor a la máxima");
      return;
    } else if (cantidadActual > cantidadMaxima) {
      toast.error("Por favor, la cantidad actual no puede ser mayor a la maxima");
      return;
    } else if (cantidadActual < cantidadMinima) {
      toast.error("Por favor, la cantidad actual no puede ser menor a la minima");
      return;
    }

    if (cantidadMinima > 0 || cantidadActual > 0 || cantidadMaxima > 0 || medida.nombre.length > 0 || costoIngrediente > 0) {
      if (!cantidadMinima || cantidadMinima < 0) {
        toast.error("Por favor, los datos con opcionales en conjunto, es necesaria la cantidad mínima");
        return;
      } else if (!cantidadMaxima || cantidadMaxima < 0) {
        toast.error("Por favor, los datos con opcionales en conjunto, es necesaria la cantidad máxima");
        return;
      } else if (!cantidadActual || cantidadActual < 0) {
        toast.error("Por favor, los datos con opcionales en conjunto, es necesaria la cantidad actual");
        return;
      } else if (cantidadActual > cantidadMaxima) {
        toast.error("Por favor, los datos con opcionales en conjunto, la cantidad actual no puede ser mayor a la maxima");
        return;
      } else if (cantidadActual < cantidadMinima) {
        toast.error("Por favor, los datos con opcionales en conjunto, la cantidad actual no puede ser menor a la minima");
        return;
      } else if (!medida || medida.nombre == '') {
        toast.error("Por favor, los datos con opcionales en conjunto, es necesario la medida");
        return;
      } else if (!costoIngrediente || costoIngrediente < 0) {
        toast.error("Por favor, los datos con opcionales en conjunto, es necesario el precio del ingrediente");
        return;
      } else if (cantidadMaxima < cantidadMinima) {
        toast.error("Por favor, los datos con opcionales en conjunto, la cantidad mínima no puede ser mayor a la máxima");
        return;
      }
    }

    if (empresa && idsSucursalesElegidas.size === 0) {
      toast.error("Por favor, seleccione al menos una sucursal");
      return;
    }
    setIsLoading(true);

    const ingrediente: Ingrediente = new Ingrediente();

    ingrediente.nombre = nombre;
    ingrediente.borrado = 'NO';

    let sucursalesElegidas: Sucursal[] = [];

    idsSucursalesElegidas.forEach(idSucursal => {
      let sucursal: Sucursal = new Sucursal();
      sucursal.id = idSucursal;
      sucursalesElegidas.push(sucursal);
    });

    ingrediente.sucursales = sucursalesElegidas;

    const stockIngredientes: StockIngredientes = new StockIngredientes();

    stockIngredientes.cantidadActual = cantidadActual;
    stockIngredientes.cantidadMinima = cantidadMinima;
    stockIngredientes.cantidadMaxima = cantidadMaxima;
    stockIngredientes.medida = medida;
    stockIngredientes.precioCompra = costoIngrediente;
    stockIngredientes.borrado = 'NO';

    let ingredienteStock: Ingrediente = new Ingrediente();
    ingredienteStock.nombre = ingrediente.nombre;

    stockIngredientes.ingrediente = ingredienteStock;

    toast.promise(IngredienteService.createIngrediente(ingrediente), {
      loading: 'Creando Ingrediente...',
      success: (message) => {
        StockIngredientesService.createStock(stockIngredientes)
        setTimeout(() => {
        }, 800);
        onCloseModal();
        return message;
      },
      error: (message) => {
        return message;
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  }


  const [mostrarInputs, setMostrarInputs] = useState(false);

  const handleClose = () => {
    setMostrarInputs(false);
    setCantidadMinima(parseInt(''));
    setCantidadMaxima(parseInt(''));
    setCantidadActual(parseInt(''));
    setCostoIngrediente(parseInt(''));
    setMedida(new Medida());
  };


  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const validateAndNextStep = () => {
    if (!nombre || !nombre.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)) {
      toast.info("Por favor, asigne un nombre válido");
      return;
    } else {
      nextStep();
    }
  }



  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Toaster />
            {empresa && empresa?.id > 0 ? (
              <h4>Paso 1 - Datos</h4>
            ) : (
              <div></div>
            )}
            <div className="inputBox">
              <input type="text" required={true} value={nombre} onChange={(e) => { setNombre(e.target.value) }} pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" />
              <span>Nombre del ingrediente</span>
              <div className="error-message">El nombre debe contener letras y espacios.</div>
            </div>
            {!empresa && mostrarInputs && (
              <>
                <h4 style={{ fontSize: '20px', textTransform: 'lowercase' }}> <strong style={{ fontWeight: '100', textTransform: 'capitalize' }}>Stock</strong>  {nombre}</h4>
                <p className='cierre-ingrediente' style={{ marginRight: '35%' }} onClick={handleClose}>X</p>
                <label>
                  <div className="inputBox">
                    <input type="text" required pattern="\d*" onChange={(e) => { setCantidadMinima(parseFloat(e.target.value)) }} />
                    <span>Cantidad mínima del ingrediente</span>
                    <div className="error-message">La cantidad mínima solo debe contener números.</div>
                  </div>
                </label>
                <label>
                  <div className="inputBox">
                    <input type="text" required pattern="\d*" onChange={(e) => { setCantidadMaxima(parseFloat(e.target.value)) }} />
                    <span>Cantidad máxima del ingrediente</span>
                    <div className="error-message">La cantidad máxima solo debe contener números.</div>
                  </div>

                </label>
                <label>
                  <div className="inputBox">
                    <input type="text" required pattern="\d*" onChange={(e) => { setCantidadActual(parseFloat(e.target.value)) }} />
                    <span>Cantidad actual del ingrediente</span>
                    <div className="error-message">La cantidad actual solo debe contener números.</div>
                  </div>

                </label>
                <InputComponent disabled={false} placeHolder={'Filtrar unidades de medida...'} onInputClick={() => setModalBusquedaMedida(true)} selectedProduct={medida.nombre ?? ''} />
                {modalBusquedaMedida && <ModalFlotanteRecomendacionesMedidas datosOmitidos={medida?.nombre} onCloseModal={handleModalClose} onSelectMedida={(medida) => { setMedida(medida); handleModalClose(); }} />}

                <div className="inputBox">
                  <input type="text" required pattern="\d*" id="costoStock" onChange={(e) => { setCostoIngrediente(parseFloat(e.target.value)) }} />
                  <span>Costo del ingrediente por una unidad de medida ($)</span>
                  <div className="error-message">El costo por unidad solo debe contener números.</div>

                </div>
              </>
            )}

            <div className="btns-pasos">
              {empresa && empresa?.id > 0 ? (
                <button className='btn-accion-adelante' onClick={validateAndNextStep}>Siguiente ⭢</button>
              ) : (
                <>
                  {!mostrarInputs && (
                    <button value="Agregar stock ahora (opcional)" id='agregarIngrediente' style={{ marginRight: '10px' }}
                      onClick={() => setMostrarInputs(!mostrarInputs)}>Agregar stock (opcional)</button>
                  )}
                  <button className='btn-accion-completar' onClick={agregarIngrediente} disabled={isLoading}>
                    {isLoading ? 'Cargando...' : 'Agregar ingrediente ✓'}
                  </button>
                </>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h4 className="paso-titulo">Paso 2 - Sucursales</h4>
            <div className="privilegios-container">
              {sucursales && sucursales.map((sucursal, index) => (
                <div key={index} className='privilegio'>
                  <>
                    <h4 className='privilegio-titulo' style={{ fontSize: '18px' }}>Sucursal: {sucursal.nombre}</h4>
                    <div className="permisos-container">
                      <div className="permiso">
                        <input
                          type="checkbox"
                          value={sucursal.id}
                          checked={idsSucursalesElegidas.has(sucursal.id) || false}
                          onChange={() => handleSucursalesElegidas(sucursal.id)}
                        />
                        <label>{sucursal.nombre}</label>
                      </div>
                    </div>


                  </>
                </div>
              ))}
            </div>
            <hr />
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>
              <button className='btn-accion-completar' onClick={agregarIngrediente} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Agregar ingrediente ✓'}
              </button>
            </div>
          </>
        );
    }
  }

  return (
    <div className="modal-info">
      <h2>&mdash; Agregar ingrediente &mdash;</h2>
      <Toaster />
      {renderStep()}

    </div >
  );
}

export default AgregarIngrediente
