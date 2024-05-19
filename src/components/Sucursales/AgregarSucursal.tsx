import { useEffect, useState } from 'react';
import { Domicilio } from '../../types/Domicilio/Domicilio';
import { Sucursal } from '../../types/Restaurante/Sucursal';
import { Localidad } from '../../types/Domicilio/Localidad';
import { SucursalService } from '../../services/SucursalService';
import { Toaster, toast } from 'sonner'
import { LocalidadDelivery } from '../../types/Restaurante/LocalidadDelivery';
import InputComponent from '../InputFiltroComponent';
import ModalFlotanteRecomendaciones from '../ModalFlotanteRecomendaciones';
import { DepartamentoService } from '../../services/DepartamentoService';
import { LocalidadService } from '../../services/LocalidadService';
import { Departamento } from '../../types/Domicilio/Departamento';

function AgregarSucursal() {
  // Atributos necesarios para Sucursal
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [calle, setCalle] = useState('');
  const [numeroCalle, setNumeroCalle] = useState(0);
  const [codigoPostal, setCodigoPostal] = useState(0);
  const [telefono, setTelefono] = useState(0);
  const [horarioApertura, setHorarioApertura] = useState('');
  const [horarioCierre, setHorarioCierre] = useState('');

  //Select que nos permite filtrar para las localidades de la sucursal asi no cargamos de más innecesariamente
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);

  const [localidadesMostrablesCheckbox, setLocalidadesMostrables] = useState<Localidad[]>([]);

  const [modalBusqueda, setModalBusqueda] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [elementosABuscar, setElementosABuscar] = useState<string>('');
  const [inputProvincia, setInputProvincia] = useState<string>('');
  const [inputDepartamento, setInputDepartamento] = useState<string>('');
  const [inputLocalidad, setInputLocalidad] = useState<string>('');

  const [idDepartamentosElegidos, setIdDepartamentosElegidos] = useState<Set<number>>(new Set<number>());

  const [idLocalidadesElegidas, setIdLocalidadesElegidas] = useState<Set<number>>(new Set<number>());

  useEffect(() => {
    buscarDepartamentos(inputProvincia)
  }, [inputProvincia]);

  useEffect(() => {
    buscarLocalidades(inputDepartamento);
  }, [inputDepartamento]);

  function buscarDepartamentos(inputProvincia: string) {
    DepartamentoService.getDepartamentosByNombreProvincia(inputProvincia)
      .then(async departamentos => {
        setDepartamentos(departamentos);
      })
      .catch(error => {
        console.error('Error:', error);
      })
  }

  function buscarLocalidades(inputDepartamento: string) {
    LocalidadService.getLocalidadesByNombreDepartamento(inputDepartamento)
      .then(async localidades => {
        setLocalidades(localidades);
      })
      .catch(error => {
        console.error('Error:', error);
      })
  }

  const handleSelectProduct = (option: string) => {
    setSelectedOption(option);
  };

  const handleAbrirRecomendaciones = (busqueda: string) => {
    setElementosABuscar(busqueda)
    setModalBusqueda(true);
  };

  const handleModalClose = () => {
    setModalBusqueda(false)
    if (elementosABuscar === 'PROVINCIAS') {
      setInputProvincia(selectedOption);
      setInputDepartamento('')
      setInputLocalidad('')
    } else if (elementosABuscar === 'DEPARTAMENTOS') {
      setInputDepartamento(selectedOption);
      setInputLocalidad('')
    } else if (elementosABuscar === 'LOCALIDADES') {
      setInputLocalidad(selectedOption);
    }
  };

  const handleDepartamentosCheckboxChange = async (departamentoId: number) => {
    // Obtener una copia del conjunto de departamentos seleccionados
    const updatedSelectedDepartamentos = new Set<number>(idDepartamentosElegidos);

    // Alternar el estado del departamento
    if (updatedSelectedDepartamentos.has(departamentoId)) {
      updatedSelectedDepartamentos.delete(departamentoId);
    } else {
      updatedSelectedDepartamentos.add(departamentoId);
    }

    // Actualizar el conjunto de departamentos seleccionados
    setIdDepartamentosElegidos(updatedSelectedDepartamentos);

    let nuevasLocalidades: Localidad[] = [];
    // Iterar sobre los departamentos seleccionados y cargar las localidades correspondientes
    for (const idDepartamento of updatedSelectedDepartamentos) {
      let localidad = localidades.find(localidad => localidad.departamento.id === idDepartamento)

      if (localidad) nuevasLocalidades.push();
    }

    setLocalidadesMostrables(nuevasLocalidades);
  };

  const handleLocalidadesCheckboxChange = (localidadId: number) => {
    const updatedSelectedLocalidades = new Set(idLocalidadesElegidas);
    if (updatedSelectedLocalidades.has(localidadId)) {
      updatedSelectedLocalidades.delete(localidadId);
    } else {
      updatedSelectedLocalidades.add(localidadId);
    }
    setIdLocalidadesElegidas(updatedSelectedLocalidades);
  };

  const handleCargarNegocio = async () => {
    if (!email) {
      toast.error("Por favor, es necesaria el email");
      return;
    } else if (!contraseña) {
      toast.error("Por favor, es necesaria la contraseña");
      return;
    } else if (!telefono) {
      toast.error("Por favor, es necesario el telefono");
      return;
    } else if (!calle) {
      toast.error("Por favor, es necesario la calle para el domicilio");
      return;
    } else if (!numeroCalle) {
      toast.error("Por favor, es necesario el numero del domicilio");
      return;
    } else if (!codigoPostal) {
      toast.error("Por favor, es necesario el código postal del domicilio");
      return;
    } else if (!inputLocalidad) {
      toast.error("Por favor, es necesario la localidad para asignar el domicilio");
      return;
    } else if (!horarioApertura) {
      toast.error("Por favor, es necesaria la hora de apertura");
      return;
    } else if (!horarioCierre) {
      toast.error("Por favor, es necesaria la hora de cierre");
      return;
    } else if (localidadesMostrablesCheckbox.length === 0) {
      toast.error("Por favor, es necesaria aunque sea una localidad donde alcance el delivery");
      return;
    }

    let sucursal: Sucursal = new Sucursal();

    const domicilio = new Domicilio();
    domicilio.calle = calle;
    domicilio.numero = numeroCalle;
    domicilio.codigoPostal = codigoPostal;
    const localidad = localidades?.find(localidad => localidad.nombre === inputLocalidad);
    domicilio.localidad = localidad
    sucursal.domicilio = domicilio;

    sucursal.contraseña = contraseña;

    sucursal.telefono = telefono;

    sucursal.email = email;

    sucursal.horarioApertura = horarioApertura;

    sucursal.horarioCierre = horarioCierre;
    let localidadesDelivery: LocalidadDelivery[] = [];

    idLocalidadesElegidas.forEach(id => {
      let localidadBuscada = localidadesMostrablesCheckbox?.find(localidad => localidad.id === id);
      let localidadNueva: LocalidadDelivery = new LocalidadDelivery();

      if (localidadBuscada) {
        localidadNueva.localidad = localidadBuscada;
        localidadesDelivery.push(localidadNueva);
      }
    });

    sucursal.localidadesDisponiblesDelivery = localidadesDelivery;

    toast.promise(SucursalService.createRestaurant(sucursal), {
      loading: 'Guardando sucursal...',
      success: () => {
        return `Sucursal añadida correctamente`;
      },
      error: 'Error',
    });

  };

  return (
    <div className='modal-info'>
      <Toaster />
      <form>
        <div className="inputBox">
          <input type="email" required={true} onChange={(e) => { setEmail(e.target.value) }} />
          <span>Correo electrónico</span>
        </div>
        <div className="inputBox">
          <input type="password" required={true} onChange={(e) => { setContraseña(e.target.value) }} />
          <span>Contraseña</span>
        </div>
        <div className="inputBox">
          <input type="text" required={true} onChange={(e) => { setCalle(e.target.value) }} />
          <span>Nombre de calle</span>
        </div>
        <div className="inputBox">
          <input type="number" required={true} onChange={(e) => { setNumeroCalle(parseInt(e.target.value)) }} />
          <span>Número de domicilio</span>
        </div>

        <div className="inputBox">
          <input type="number" required={true} onChange={(e) => { setCodigoPostal(parseInt(e.target.value)) }} />
          <span>Código Postal</span>
        </div>
        <div className="inputBox">
          <input type="phone" required={true} onChange={(e) => { setTelefono(parseInt(e.target.value)) }} />
          <span>Telefono</span>
        </div>
        <div className="inputBox">
          <input type="time" required={true} onChange={(e) => { setHorarioApertura(e.target.value) }} />
          <span>Horario de apertura</span>
        </div>
        <div className="inputBox">
          <input type="time" required={true} onChange={(e) => { setHorarioCierre(e.target.value) }} />
          <span>Horario de cierre</span>
        </div>
        <div className="inputBox">
          <input type="text" required={true} onChange={(e) => { setCalle(e.target.value) }} />
          <span>Nombre de calle</span>
        </div>
        <div className="inputBox">
          <input type="number" required={true} onChange={(e) => { setNumeroCalle(parseInt(e.target.value)) }} />
          <span>Número de domicilio</span>
        </div>
        <div className="inputBox">
          <input type="number" required={true} onChange={(e) => { setCodigoPostal(parseInt(e.target.value)) }} />
          <span>Código Postal</span>
        </div>
        <h2>Provincia</h2>
        <InputComponent placeHolder='Seleccionar provincia...' onInputClick={() => handleAbrirRecomendaciones('PROVINCIAS')} selectedProduct={inputProvincia ?? ''} />
        {modalBusqueda && <ModalFlotanteRecomendaciones elementoBuscado={elementosABuscar} onCloseModal={handleModalClose} onSelectProduct={handleSelectProduct} datoNecesario={''} />}
        <br />
        <h2>Departamento</h2>
        <InputComponent placeHolder='Seleccionar departamento...' onInputClick={() => handleAbrirRecomendaciones('DEPARTAMENTOS')} selectedProduct={inputDepartamento ?? ''} />
        {modalBusqueda && <ModalFlotanteRecomendaciones elementoBuscado={elementosABuscar} onCloseModal={handleModalClose} onSelectProduct={handleSelectProduct} datoNecesario={selectedOption} />}

        <br />
        <h2>Localidad</h2>
        <InputComponent placeHolder='Seleccionar localidad...' onInputClick={() => handleAbrirRecomendaciones('LOCALIDADES')} selectedProduct={inputLocalidad ?? ''} />
        {modalBusqueda && <ModalFlotanteRecomendaciones elementoBuscado={elementosABuscar} onCloseModal={handleModalClose} onSelectProduct={handleSelectProduct} datoNecesario={selectedOption} />}


        <h3>Departamentos disponibles para delivery: </h3>
        {departamentos && (
          <div>
            {departamentos.map((departamento, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`localidad-${index}`}
                  value={departamento.id}
                  checked={idDepartamentosElegidos.has(departamento.id)}
                  onChange={() => handleDepartamentosCheckboxChange(departamento.id)}
                />
                <label htmlFor={`departamento-${index}`}>{departamento.nombre}</label>
              </div>
            ))}
          </div>
        )}

        <h3>Localidades disponibles para delivery: </h3>
        {localidadesMostrablesCheckbox && (
          <div>
            {localidadesMostrablesCheckbox.map((localidad, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  value={localidad.id}
                  checked={idLocalidadesElegidas.has(localidad.id)}
                  onChange={() => handleLocalidadesCheckboxChange(localidad.id)}
                />
                <label htmlFor={`localidad-${index}`}>{localidad.nombre}</label>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={handleCargarNegocio}>Registrarse</button>
      </form>
    </div>
  )
}

export default AgregarSucursal
