import { useEffect, useState } from 'react';
import { EmpleadoService } from '../../services/EmpleadoService';
import { Empleado } from '../../types/Restaurante/Empleado';
import '../../styles/empleados.css';
import { Toaster, toast } from 'sonner'
import { Domicilio } from '../../types/Domicilio/Domicilio';
import InputComponent from '../InputFiltroComponent';
import { Localidad } from '../../types/Domicilio/Localidad';
import ModalFlotanteRecomendacionesDepartamentos from '../../hooks/ModalFlotanteFiltroDepartamentos';
import ModalFlotanteRecomendacionesProvincias from '../../hooks/ModalFlotanteFiltroProvincia';
import ModalFlotanteRecomendacionesLocalidades from '../../hooks/ModalFlotanteFiltroLocalidades';
import ModalFlotanteRecomendacionesSucursales from '../../hooks/ModalFlotanteFiltroSucursales';
import ModalFlotanteRecomendacionesPais from '../../hooks/ModalFlotanteFiltroPais';
import { Departamento } from '../../types/Domicilio/Departamento';
import { Provincia } from '../../types/Domicilio/Provincia';
import { Pais } from '../../types/Domicilio/Pais';
import { formatearFechaYYYYMMDD } from '../../utils/global_variables/functions';
import { PrivilegiosService } from '../../services/PrivilegiosService';
import ModalFlotanteRecomendacionesRoles from '../../hooks/ModalFlotanteFiltroRoles';
import { RolesEmpleado } from '../../types/Restaurante/RolesEmpleados';
import { Roles } from '../../types/Restaurante/Roles';
import { PrivilegiosEmpleados } from '../../types/Restaurante/PrivilegiosEmpleado';
import { PrivilegiosSucursales } from '../../types/Restaurante/PrivilegiosSucursales';
import { Imagenes } from '../../types/Productos/Imagenes';

interface EditarEmpleadoProps {
  empleadoOriginal: Empleado;
  onCloseModal: () => void;
}

const EditarEmpleado: React.FC<EditarEmpleadoProps> = ({ empleadoOriginal, onCloseModal }) => {
  const [nombre, setNombre] = useState(empleadoOriginal.nombre);
  const [email, setEmail] = useState(empleadoOriginal.email);
  const [cuil, setCuit] = useState(empleadoOriginal.cuil);
  const [contraseña, setContraseña] = useState('');
  const [telefono, setTelefono] = useState(empleadoOriginal.telefono);
  const [fechaNacimiento, setFechaNacimiento] = useState<Date>(new Date(empleadoOriginal.fechaNacimiento));
  const [sucursal, setSucursal] = useState(empleadoOriginal.sucursales[0]);

  const [indexDomicilio, setIndexDomicilio] = useState<number>(0);
  const [indexDomicilioModificable, setIndexDomicilioModificable] = useState<number>(0);
  const [domiciliosModificable, setDomiciliosModificable] = useState<Domicilio[]>(empleadoOriginal.domicilios);
  const [domicilios, setDomicilios] = useState<Domicilio[]>([]);

  const [indexRoles, setIndexRoles] = useState<number>(0);
  const [indexRolesModificables, setIndexRolesModificables] = useState<number>(0);
  const [rolesModificables, setRolesModificables] = useState<RolesEmpleado[]>(empleadoOriginal.roles);
  const [roles, setRoles] = useState<RolesEmpleado[]>([]);
  const [rolesElegidos, setRolesElegidos] = useState<string[]>([]);

  const [privilegiosElegidos, setPrivilegiosElegidos] = useState<{ [nombre: string]: string[] }>({});
  const [privilegios, setPrivilegios] = useState<PrivilegiosSucursales[]>([]);

  const [imagenesMuestra, setImagenesMuestra] = useState<Imagenes[]>(empleadoOriginal.imagenes);
  const [imagenesEliminadas, setImagenesEliminadas] = useState<Imagenes[]>([]);
  const [imagenes, setImagenes] = useState<Imagenes[]>([]);
  const [selectIndex, setSelectIndex] = useState<number>(0);

  const filteredPrivilegios = privilegios?.filter(
    (privilegio) =>
      privilegio.nombre !== 'Empleados' &&
      privilegio.nombre !== 'Sucursales' &&
      privilegio.nombre !== 'Estadísticas' &&
      privilegio.nombre !== 'Empresas'
  );

  const filteredPrivilegiosOpcionales = privilegios?.filter(
    (privilegio) =>
      privilegio.nombre == 'Empleados' || privilegio.nombre == 'Sucursales' || privilegio.nombre == 'Estadísticas' || privilegio.nombre == 'Empresas'
  );

  const handleImagen = (index: number, file: File | null) => {
    if (file) {
      const newImagenes = [...imagenes];
      newImagenes[index] = { ...newImagenes[index], file };
      setImagenes(newImagenes);
    }
  };

  const añadirCampoImagen = () => {
    let imagenNueva = new Imagenes();
    imagenNueva.index = imagenes.length;
    setImagenes([...imagenes, imagenNueva]);
  };

  const quitarCampoImagen = () => {
    if (imagenes.length > 0) {
      const nuevasImagenes = [...imagenes];
      nuevasImagenes.pop();
      setImagenes(nuevasImagenes);

      if (selectIndex > 0) {
        setSelectIndex(prevIndex => prevIndex - 1);
      }
    }
  };

  const handleEliminarImagen = (index: number) => {
    const nuevasImagenes = [...imagenesMuestra];
    const imagenEliminada = nuevasImagenes.splice(index, 1)[0];
    setImagenesMuestra(nuevasImagenes);
    setImagenesEliminadas([...imagenesEliminadas, imagenEliminada]);
  };

  const handleChangeCalle = (index: number, calle: string) => {
    const nuevosDomicilios = [...domicilios];
    nuevosDomicilios[index].calle = calle;
    setDomicilios(nuevosDomicilios);
  };

  const handleChangeNumeroCasa = (index: number, numero: number) => {
    const nuevosDomicilios = [...domicilios];
    nuevosDomicilios[index].numero = numero;
    setDomicilios(nuevosDomicilios);
  };

  const handleChangeCodigoPostal = (index: number, codigoPostal: number) => {
    const nuevosDomicilios = [...domicilios];
    nuevosDomicilios[index].codigoPostal = codigoPostal;
    setDomicilios(nuevosDomicilios);
  };

  const handleChangePais = (index: number, pais: Pais) => {
    const nuevosDomicilios = [...domicilios];
    if (pais) {
      nuevosDomicilios[index].localidad.departamento.provincia.pais = pais;
      setDomicilios(nuevosDomicilios);
    }
  };

  const handleChangeProvincia = (index: number, provincia: Provincia) => {
    const nuevosDomicilios = [...domicilios];
    if (provincia) {
      nuevosDomicilios[index].localidad.departamento.provincia = provincia;
      setDomicilios(nuevosDomicilios);
    }
  };

  const handleChangeDepartamento = (index: number, departamento: Departamento) => {
    const nuevosDomicilios = [...domicilios];
    if (departamento) {
      nuevosDomicilios[index].localidad.departamento = departamento;
      setDomicilios(nuevosDomicilios);
    }
  };


  const handleChangeLocalidad = (index: number, localidad: Localidad) => {
    const nuevosDomicilios = [...domicilios];
    if (localidad) {
      nuevosDomicilios[index].localidad = localidad;
      setDomicilios(nuevosDomicilios);
    }
  };

  const añadirCampoDomicilio = () => {
    // SI no hay ingredientes que genere en valor 0 de index
    setDomicilios([...domicilios, { id: 0, calle: '', numero: 0, codigoPostal: 0, localidad: new Localidad(), borrado: 'NO' }]);
    setIndexDomicilio(prevIndex => prevIndex + 1);
  };

  const quitarCampoDomicilio = (index: number) => {
    if (indexDomicilio > 0) {
      const nuevosDomicilios = [...domicilios];
      nuevosDomicilios.splice(index, 1);
      setDomicilios(nuevosDomicilios);

      if (indexDomicilio > 0) {
        setIndexDomicilio(indexDomicilio - 1);
      }
    } else {
      setDomicilios([]);
      setIndexDomicilio(0);
    }
  };

  const quitarCampoDomicilioModificable = (index: number) => {
    if (domiciliosModificable.length > 0) {
      const nuevosDomicilios = [...domiciliosModificable];
      nuevosDomicilios.splice(index, 1);
      setDomiciliosModificable(nuevosDomicilios);

      if (indexDomicilioModificable > 0) {
        setIndexDomicilioModificable(indexDomicilioModificable - 1);
      }
    } else {
      setDomiciliosModificable([]);
      setIndexDomicilioModificable(0);
    }
  };

  const handleChangeRol = (index: number, rol: Roles) => {
    const nuevosRoles = [...roles];
    nuevosRoles[index].rol = rol;
    setRoles(nuevosRoles);

    const nuevosNombresRoles = [...rolesElegidos];
    nuevosNombresRoles[index] = rol.nombre;
    setRolesElegidos(nuevosNombresRoles);
  };

  const añadirCampoRol = () => {
    // SI no hay ingredientes que genere en valor 0 de index
    setRoles([...roles, { id: 0, rol: new Roles(), borrado: 'no' }]);
    setIndexRoles(prevIndex => prevIndex + 1);
  };

  const quitarCampoRol = (nombreRol: string, index: number) => {
    const nuevosNombres = rolesElegidos.filter(nombre => nombre !== nombreRol);
    setRolesElegidos(nuevosNombres);

    if (indexRoles > 0) {
      const nuevosRoles = [...roles];
      nuevosRoles.splice(index, 1);
      setRoles(nuevosRoles);

      if (indexRoles > 0) {
        setIndexRoles(indexRoles - 1);
      }
    } else {
      setRoles([]);
      setIndexRoles(0);
    }
  };

  const quitarCampoRolModificable = (nombreRol: string, index: number) => {
    const nuevosNombres = rolesElegidos.filter(nombre => nombre !== nombreRol);
    setRolesElegidos(nuevosNombres);

    if (rolesModificables.length > 0) {
      const nuevosRoles = [...rolesModificables];
      nuevosRoles.splice(index, 1);
      setRolesModificables(nuevosRoles);

      if (indexRolesModificables > 0) {
        setIndexRolesModificables(indexRolesModificables - 1);
      }
    } else {
      setRolesModificables([]);
      setIndexRolesModificables(0);
    }
  };

  useEffect(() => {
    PrivilegiosService.getPrivilegios()
      .then(data => {
        setPrivilegios(data);
        cargarPrivilegios();
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    empleadoOriginal.roles.forEach(rol => {
      rolesElegidos.push(rol.rol.nombre);
    });
  }, []);

  const cargarPrivilegios = () => {
    empleadoOriginal.privilegios?.forEach(privilegios => {
      setPrivilegiosElegidos(prevState => {
        const { nombre } = privilegios;
        const nuevosPrivilegios = [...(prevState[nombre] || []), ...privilegios.permisos];
        return { ...prevState, [nombre]: nuevosPrivilegios };
      });
    });
  };

  const handleModificarPrivilegios = (nombre: string, permiso: string) => {
    setPrivilegiosElegidos((prev) => {
      const permisosActuales = prev[nombre] || [];
      if (permisosActuales.includes(permiso)) {
        return {
          ...prev,
          [nombre]: permisosActuales.filter(p => p !== permiso)
        };
      } else {
        return {
          ...prev,
          [nombre]: [...permisosActuales, permiso]
        };
      }
    });
  };

  const desmarcarTarea = (nombre: string) => {
    setPrivilegiosElegidos((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [nombre]: _, ...rest } = prev; // Da error pero ta bien
      return rest;
    });
  };

  const marcarTarea = (nombre: string, permisos: string[]) => {
    setPrivilegiosElegidos((prev) => ({
      ...prev,
      [nombre]: permisos,
    }));
  };

  const [modalBusquedaSucursal, setModalBusquedaSucursal] = useState<boolean>(false);
  const [modalBusquedaProvincia, setModalBusquedaProvincia] = useState<boolean>(false);
  const [modalBusquedaDepartamento, setModalBusquedaDepartamento] = useState<boolean>(false);
  const [modalBusquedaLocalidad, setModalBusquedaLocalidad] = useState<boolean>(false);
  const [modalBusquedaPais, setModalBusquedaPais] = useState<boolean>(false);
  const [modalBusquedaRol, setModalBusquedaRol] = useState<boolean>(false);

  const handleModalClose = () => {
    setModalBusquedaProvincia(false)
    setModalBusquedaDepartamento(false)
    setModalBusquedaLocalidad(false)
    setModalBusquedaPais(false)
    setModalBusquedaRol(false)
  };

  const formatDate = (date: Date) => {
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return new Date(year, month - 1, day);
  };

  const [isLoading, setIsLoading] = useState(false);

  async function editarEmpleado() {
    if (!nombre) {
      toast.error("Por favor, es necesario el nombre");
      return;
    } else if (!email) {
      toast.error("Por favor, es necesaria el email");
      return;
    } else if (!telefono) {
      toast.error("Por favor, es necesario el telefono");
      return;
    } else if (!cuil) {
      toast.error("Por favor, es necesario el cuil");
      return;
    } else if (!fechaNacimiento) {
      toast.error("Por favor, es necesaria la fecha de nacimiento");
      return;
    }

    if (domiciliosModificable.length === 0 && domicilios.length === 0) {
      toast.info("Se debe agregar al menos un domicilio.");
      return;
    }

    if (rolesModificables?.length === 0 && roles?.length === 0) {
      toast.info("Se debe agregar al menos un domicilio.");
      return;
    }

    setIsLoading(true);

    let domiciliosValidos = [...domiciliosModificable, ...domicilios].filter(domicilio =>
      domicilio.calle && domicilio.numero && domicilio.codigoPostal
    );

    if (domiciliosValidos.length === 0) {
      toast.info("Se debe agregar al menos un domicilio válido.");
      return;
    }


    const empleadoActualizado: Empleado = {
      ...empleadoOriginal,
      nombre,
      email,
      cuil,
      contraseña,
      fechaNacimiento: formatDate(new Date(fechaNacimiento)),
      telefono
    };

    domiciliosModificable.forEach((nuevoDomicilio) => {
      const existe = domicilios.some((domicilio) =>
        domicilio.numero === nuevoDomicilio.numero &&
        domicilio.calle === nuevoDomicilio.calle &&
        domicilio.codigoPostal === nuevoDomicilio.codigoPostal
      );

      if (!existe) {
        empleadoActualizado.domicilios.push(nuevoDomicilio);
      } else {
        empleadoActualizado.domicilios = empleadoActualizado.domicilios.filter(s => s.id !== nuevoDomicilio.id);
        empleadoActualizado.domicilios.push(nuevoDomicilio);
      }
    });

    rolesModificables?.forEach((rol) => {
      const existe = roles.some((rolNuevo) =>
        rol.rol === rolNuevo.rol
      );

      if (!existe) {
        roles.push(rol);
      }
    });

    const empleadoPrivilegios: PrivilegiosEmpleados[] = Object.entries(privilegiosElegidos).map(([nombre, permisos]) => {
      return new PrivilegiosEmpleados(0, permisos, 0, nombre, 'NO');
    });

    empleadoActualizado.domicilios = domicilios;

    empleadoActualizado.privilegios = empleadoPrivilegios

    // Por las dudas, se busca si la sucursal existe, en ese caso se borra para evitar duplicaciones
    if (sucursal && !empleadoActualizado.sucursales.some(s => s.nombre === sucursal.nombre)) {
      empleadoActualizado.sucursales.push(sucursal);
    } else {
      empleadoActualizado.sucursales = empleadoActualizado.sucursales.filter(s => s.id !== sucursal.id);
      empleadoActualizado.sucursales.push(sucursal);
    }

    domicilios.forEach(domicilio => {
      if (domicilio && !empleadoActualizado.domicilios.some(s => s.calle === domicilio.calle && s.localidad === domicilio.localidad && s.codigoPostal === domicilio.codigoPostal)) {
        empleadoActualizado.domicilios.push(domicilio);
      } else {
        empleadoActualizado.domicilios = empleadoActualizado.domicilios.filter(s => s.id !== domicilio.id);
        empleadoActualizado.domicilios.push(domicilio);
      }
    });

    roles.forEach(rol => {
      if (rol && !empleadoActualizado.roles?.some(s => s.rol === rol.rol)) {
        empleadoActualizado.roles?.push(rol);
      } else {
        empleadoActualizado.roles = empleadoActualizado.roles?.filter(s => s.id !== rol.id);
        empleadoActualizado.roles?.push(rol);
      }
    });

    empleadoActualizado.borrado = empleadoOriginal.borrado;

    empleadoActualizado.roles = roles;


    toast.promise(EmpleadoService.updateEmpleado(empleadoActualizado, imagenes, imagenesEliminadas), {
      loading: 'Actualizando empleado...',
      success: (message) => {
        setTimeout(() => {
          onCloseModal();
        }, 800);
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

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagenesMuestra.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imagenesMuestra.length - 1 : prevIndex - 1
    );
  };

  //SEPARAR EN PASOS
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const validateAndNextStep = () => {

    // Validación de fecha de nacimiento
    const hoy = new Date();
    const fechaMinima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()); // Fecha actual menos 18 años

    if (!nombre || !nombre.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)) {
      toast.error("Por favor, es necesario un nombre válido");
      return;
    } else if (!email || !email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,}/)) {
      toast.error("Por favor, es necesario un e-mail válido");
      return;
    } else if (!telefono || telefono < 10) {
      toast.error("Por favor, es necesario un número de teléfono válido");
      return;
    } else if (!cuil || cuil.length !== 13) {
      toast.error("Por favor, es necesario un CUIL válido");
      return;
    } else if (!fechaNacimiento || fechaNacimiento > fechaMinima) {
      toast.error("Por favor, es necesaria una fecha de nacimiento válida. (Empleado mayor a 18 años)");
      return;
    } else {
      nextStep();
    }

  }

  const validateAndNextStep2 = () => {

    if (!domicilios || domicilios.length === 0) {
      toast.info("Por favor, es necesario asignarle mínimo un domicilio al empleado");
      return;
    }

    for (let i = 0; i < domicilios.length; i++) {
      const calle = domicilios[i].calle;
      const numero = domicilios[i].numero;
      const codigoPostal = domicilios[i].codigoPostal;
      const pais = domicilios[i].localidad.departamento.provincia.pais;
      const provincia = domicilios[i].localidad.departamento.provincia;
      const departamento = domicilios[i].localidad.departamento;
      const localidad = domicilios[i].localidad;

      console.log(calle)

      if (!calle || !calle.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)) {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener una calle`);
        return;
      } else if (!numero || (numero > 9999 || numero < 1)) {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener un numero de casa`);
      } else if (!codigoPostal || (codigoPostal > 9431 || codigoPostal < 1001)) {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener un código postal`);
      } else if (pais.nombre == '') {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener un país`);
      } else if (provincia.nombre == '') {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener una provincia`);
      } else if (departamento.nombre == '') {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener un departamento`);
      } else if (localidad.nombre == '') {
        toast.info(`Por favor, el domicilio ${i + 1} debe contener una localidad`);
      }
    }

    if (domicilios) {
      nextStep();
    }
  }

  const validateAndNextStep3 = () => {

    if (!roles || rolesElegidos.length === 0) {
      toast.info("Por favor, es necesario asignarle mínimo un rol al empleado");
      return;
    }

    for (let i = 0; i < roles.length; i++) {
      const rol = roles[i].rol


      if (!rol) {
        toast.info(`Complete el rol ${i + 1} que desea asignar`);
        return;
      }

    }

    if (roles) {
      nextStep();
    }
  }

  const estanTodosMarcados = (privilegiosElegidos: { [x: string]: string | any[] | string[]; }, privilegio: PrivilegiosSucursales) => {
    return privilegio.permisos.every((permiso: any) => privilegiosElegidos[privilegio.nombre]?.includes(permiso));
  };

  const estanTodosDesmarcados = (privilegiosElegidos: { [x: string]: string | any[] | string[]; }, privilegio: PrivilegiosSucursales) => {
    return privilegio.permisos.every((permiso: any) => !privilegiosElegidos[privilegio.nombre]?.includes(permiso));
  };


  //VALIDAR CUIL

  const formatearCuil = (value: string) => {
    // Eliminar todos los caracteres no numéricos
    const soloNumeros = value.replace(/\D/g, "");

    // Insertar los guiones en las posiciones correctas
    let cuilFormateado = "";
    if (soloNumeros.length > 2) {
      cuilFormateado += soloNumeros.slice(0, 2) + "-";
      if (soloNumeros.length > 10) {
        cuilFormateado += soloNumeros.slice(2, 10) + "-";
        cuilFormateado += soloNumeros.slice(10, 11);
      } else {
        cuilFormateado += soloNumeros.slice(2);
      }
    } else {
      cuilFormateado = soloNumeros;
    }

    return cuilFormateado;
  };


  const handleCuilChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    const cuilFormateado = formatearCuil(value);
    setCuit(cuilFormateado);
  };

  const handleTelefonoChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    // Permitir solo valores numéricos
    if (/^\d*$/.test(value)) {
      setTelefono(value);
    }
  };



  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h4>Paso 1 - Datos</h4>
            <div className="inputBox">
              <input type="text" required={true} pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+" value={nombre} onChange={(e) => { setNombre(e.target.value) }} />
              <span>Nombre del empleado</span>
              <div className="error-message">El nombre debe contener letras y espacios.</div>

            </div>
            <div className="inputBox">
              <input type="text" required={true} value={email} onChange={(e) => { setEmail(e.target.value) }} />
              <span>Email del empleado</span>
              <div className="error-message">Formato incorrecto de e-mail.</div>
            </div>
            <div className="inputBox">
              <input type="text" pattern=".{13}" required={true} value={cuil} onChange={handleCuilChange} />
              <span>CUIL del empleado</span>
            </div>
            <div className="inputBox">
              <input type="password" pattern=".{8,}" required={true} value={contraseña} onChange={(e) => { setContraseña(e.target.value) }} />
              <span>Contraseña del empleado</span>
              <div className="error-message">La contraseña debe tener mínimo 8 dígitos.</div>

            </div>
            <div className="inputBox">
              <input type="text" pattern="\d{10}" required={true} value={telefono} onChange={handleTelefonoChange} />
              <span>Teléfono del empleado</span>
              <div className="error-message">El número de teléfono no es válido. Mínimo 10 dígitos</div>

            </div>
            <div className="inputBox">

              <label style={{ display: 'flex', fontWeight: 'bold' }}>Fecha de nacimiento:</label>
              <input type="date" required={true} value={formatearFechaYYYYMMDD((fechaNacimiento))} onChange={(e) => setFechaNacimiento(new Date(e.target.value))} />
              <div className="error-message" style={{ marginTop: '70px' }}>No es una fecha válida. (El empleado debe ser mayor a 18 años)</div>

            </div>
            <InputComponent disabled={false} placeHolder='Seleccionar sucursal...' onInputClick={() => setModalBusquedaSucursal(true)} selectedProduct={sucursal?.nombre ?? ''} />
            {modalBusquedaSucursal && <ModalFlotanteRecomendacionesSucursales datosOmitidos={sucursal?.nombre ?? ''} onCloseModal={handleModalClose} onSelectSucursal={(sucursal) => { setSucursal(sucursal); handleModalClose(); }} />}
            <div className="btns-pasos">
              <button className='btn-accion-adelante' onClick={validateAndNextStep}>Siguiente ⭢</button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h4>Paso 2 - Imagenes (opcional)</h4>
            <div className="slider-container">
              <button onClick={prevImage} className="slider-button prev">◀</button>
              <div className='imagenes-wrapper'>
                {imagenesMuestra.map((imagen, index) => (
                  <div key={index} className={`imagen-muestra ${index === currentIndex ? 'active' : ''}`}>
                    <p className='cierre-ingrediente' onClick={() => handleEliminarImagen(index)}>X</p>
                    <label style={{ fontSize: '20px' }}>_imagenes asociadas</label>

                    {imagen && (
                      <img

                        src={imagen.ruta}
                        alt={`Imagen ${index}`}
                      />
                    )}
                  </div>

                ))}
                <button onClick={nextImage} className="slider-button next">▶</button>
              </div>
            </div>

            {imagenes.map((imagen, index) => (
              <div key={index} className='inputBox'>
                <hr />
                <p className='cierre-ingrediente' onClick={() => quitarCampoImagen()}>X</p>
                <h4 style={{ fontSize: '18px' }}>Imagen {index + 1}</h4>
                <br />
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    id={`file-input-${index}`}
                    className="file-input"
                    onChange={(e) => handleImagen(index, e.target.files?.[0] ?? null)}
                  />
                  <label htmlFor={`file-input-${index}`} className="file-input-label">
                    {imagen.file ? (
                      <p>Archivo seleccionado: {imagen.file.name}</p>
                    ) : (
                      <p>Seleccionar un archivo</p>
                    )}
                  </label>
                </div>
              </div>
            ))}
            <br />
            <button onClick={añadirCampoImagen}>Añadir imagen</button>
            <hr />
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>
              <button className='btn-accion-adelante' onClick={nextStep}>Siguiente ⭢</button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h4>Paso 3 - Roles</h4>
            {rolesModificables && rolesModificables.map((roles, index) => (
              <div key={'domicilioMod' + index}>
                <hr />
                <p className='cierre-ingrediente' onClick={() => quitarCampoRolModificable(roles.rol.nombre, index)}>X</p>

                <h2>Rol actual {index + 1}</h2>
                <div className="inputBox">
                  <input type="text" disabled={true} required={true} value={roles.rol.nombre} />
                </div>
              </div>
            ))}
            {roles && roles.map((rol, index) => (
              <>
                <div key={'domicilio' + index}>
                  <h2>Rol nuevo {index + 1}</h2>
                  <p onClick={() => quitarCampoRol(rol.rol.nombre, index)}>X</p>
                  <InputComponent disabled={false} placeHolder='Seleccionar rol...' onInputClick={() => setModalBusquedaRol(true)} selectedProduct={rol.rol.nombre ?? ''} />
                  {modalBusquedaRol && <ModalFlotanteRecomendacionesRoles datosOmitidos={rolesElegidos} onCloseModal={handleModalClose} onSelectRol={(rol) => { handleChangeRol(index, rol); handleModalClose(); }} />}
                </div >
                <hr />
              </>
            ))}
            <button onClick={añadirCampoRol}>Añadir rol</button>
            <hr />
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>
              <button className='btn-accion-adelante' onClick={nextStep}>Siguiente ⭢</button>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h4>Paso 4 - Domicilio/os</h4>
            {domiciliosModificable && domiciliosModificable.map((domicilio, index) => (
              <div key={'domicilioMod' + index}>
                <hr />
                <p className='cierre-ingrediente' onClick={() => quitarCampoDomicilioModificable(index)}>X</p>
                <h2>Domicilio actual {index + 1}</h2>
                <div className="inputBox">
                  <input type="text" required={true} value={domicilio.calle} onChange={(e) => { handleChangeCalle(index, e.target.value) }} />
                  <span>Nombre de calle</span>
                </div>
                <div className="inputBox">
                  <input type="number" required={true} value={domicilio.numero} onChange={(e) => { handleChangeNumeroCasa(index, parseInt(e.target.value)) }} />
                  <span>Número de domicilio</span>
                </div>
                <div className="inputBox">
                  <input type="number" required={true} value={domicilio.codigoPostal} onChange={(e) => { handleChangeCodigoPostal(index, parseInt(e.target.value)) }} />
                  <span>Código Postal</span>
                </div>
                <div className="inputBox">
                  <input type="text" disabled required={true} value={domicilio.localidad?.nombre} />
                </div>
              </div>
            ))}
            {domicilios && domicilios.map((domicilio, index) => (
              <div key={'domicilio' + index}>
                <h2>Domicilio nuevo {index + 1}</h2>
                <hr /><p onClick={() => quitarCampoDomicilio(index)}>X</p>
                <div className="inputBox">
                  <input type="text" required={true} onChange={(e) => { handleChangeCalle(index, e.target.value) }} />
                  <span>Nombre de calle</span>
                </div>
                <div className="inputBox">
                  <input type="number" required={true} onChange={(e) => { handleChangeNumeroCasa(index, parseInt(e.target.value)) }} />
                  <span>Número de domicilio</span>
                </div>
                <div className="inputBox">
                  <input type="number" required={true} onChange={(e) => { handleChangeCodigoPostal(index, parseInt(e.target.value)) }} />
                  <span>Código Postal</span>
                </div>
                <label style={{ display: 'flex', fontWeight: 'bold' }}>Pais:</label>
                <InputComponent disabled={false} placeHolder='Seleccionar pais...' onInputClick={() => setModalBusquedaPais(true)} selectedProduct={domicilio.localidad?.departamento?.provincia?.pais?.nombre ?? ''} />
                {modalBusquedaPais && <ModalFlotanteRecomendacionesPais onCloseModal={handleModalClose} onSelectPais={(pais) => { handleChangePais(index, pais); handleModalClose(); }} />}
                <label style={{ display: 'flex', fontWeight: 'bold' }}>Provincia:</label>
                <InputComponent disabled={domicilio.localidad?.departamento?.provincia?.pais.nombre.length === 0} placeHolder='Seleccionar provincia...' onInputClick={() => setModalBusquedaProvincia(true)} selectedProduct={domicilio.localidad?.departamento?.provincia?.nombre ?? ''} />
                {modalBusquedaProvincia && <ModalFlotanteRecomendacionesProvincias onCloseModal={handleModalClose} onSelectProvincia={(provincia) => { handleChangeProvincia(index, provincia); handleModalClose(); }} />}
                <label style={{ display: 'flex', fontWeight: 'bold' }}>Departamento:</label>
                <InputComponent disabled={domicilio.localidad?.departamento?.provincia?.nombre.length === 0} placeHolder='Seleccionar departamento...' onInputClick={() => setModalBusquedaDepartamento(true)} selectedProduct={domicilio.localidad?.departamento?.nombre ?? ''} />
                {modalBusquedaDepartamento && <ModalFlotanteRecomendacionesDepartamentos onCloseModal={handleModalClose} onSelectDepartamento={(departamento) => { handleChangeDepartamento(index, departamento); handleModalClose(); }} inputProvincia={domicilio.localidad?.departamento?.provincia?.nombre} />}
                <label style={{ display: 'flex', fontWeight: 'bold' }}>Localidad:</label>
                <InputComponent disabled={domicilio.localidad?.departamento?.nombre.length === 0} placeHolder='Seleccionar localidad...' onInputClick={() => setModalBusquedaLocalidad(true)} selectedProduct={domicilio.localidad.nombre ?? ''} />
                {modalBusquedaLocalidad && <ModalFlotanteRecomendacionesLocalidades onCloseModal={handleModalClose} onSelectLocalidad={(localidad) => { handleChangeLocalidad(index, localidad); handleModalClose(); }} inputDepartamento={domicilio.localidad?.departamento?.nombre} inputProvincia={domicilio.localidad?.departamento?.provincia?.nombre} />}
                <hr />
              </div>
            ))}
            <button onClick={añadirCampoDomicilio}>Añadir domicilio</button>
            <hr />
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>
              <button className='btn-accion-adelante' onClick={nextStep}>Siguiente ⭢</button>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h4 className="paso-titulo">Paso 5 - Privilegios comunes</h4>
            <div className="privilegios-container">
              {filteredPrivilegios && filteredPrivilegios.map((privilegio, index) => (
                <div key={index} className='privilegio'>
                  {privilegio.nombre !== 'Empleados' && privilegio.nombre !== 'Sucursales' && privilegio.nombre !== 'Estadísticas' && privilegio.nombre !== 'Empresas' && (
                    <>
                      <div className="marcajes">
                        <p
                          className={`cierre-privilegios ${estanTodosDesmarcados(privilegiosElegidos, privilegio) ? 'desactivado' : ''}`}
                          onClick={() => !estanTodosDesmarcados(privilegiosElegidos, privilegio) && desmarcarTarea(privilegio.nombre)}
                        >
                          Desmarcar todo
                        </p>
                        <p
                          className={`cierre-privilegios ${estanTodosMarcados(privilegiosElegidos, privilegio) ? 'desactivado' : ''}`}
                          onClick={() => !estanTodosMarcados(privilegiosElegidos, privilegio) && marcarTarea(privilegio.nombre, privilegio.permisos)}
                        >
                          Marcar todo
                        </p>
                      </div>
                      <h4 className="privilegio-titulo">&mdash; {privilegio.nombre} &mdash;</h4>
                      <div className="permisos-container">
                        {privilegio.permisos && privilegio.permisos.map((permiso, permisoIndex) => (
                          <div key={permisoIndex} className="permiso">
                            <input
                              type="checkbox"
                              value={permiso}
                              checked={privilegiosElegidos[privilegio.nombre]?.includes(permiso) || false}
                              onChange={() => handleModificarPrivilegios(privilegio.nombre, permiso)}
                            />
                            <label>{permiso}</label>
                          </div>
                        ))}
                      </div>

                      <hr />
                    </>
                  )}
                </div>
              ))}
            </div>

            <hr />
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>

              <button className='btn-accion-adelante' onClick={nextStep}>Privilegios sensibles (opcional) ⭢</button>
              <button className='btn-accion-completar' onClick={editarEmpleado} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Editar empleado ✓'}
              </button>
            </div>
          </>
        );
      case 6:
        return (
          <>
            <h4 className="paso-titulo">Paso opcional - Privilegios sensibles</h4>
            <p>Recomendamos que estos privilegios estén deshabilitados ya que pueden dar acceso a datos sensibles</p>
            <div className="privilegios-container">
              {filteredPrivilegiosOpcionales && filteredPrivilegiosOpcionales.map((privilegio, index) => (
                <div key={index} className='privilegio-opcional'>
                  {(privilegio.nombre === 'Empleados' || privilegio.nombre === 'Sucursales' || privilegio.nombre === 'Estadísticas' || privilegio.nombre === 'Empresas') && (
                    <>
                      <hr />
                      <div className="marcajes">
                        <p
                          className={`cierre-privilegios ${estanTodosDesmarcados(privilegiosElegidos, privilegio) ? 'desactivado' : ''}`}
                          onClick={() => !estanTodosDesmarcados(privilegiosElegidos, privilegio) && desmarcarTarea(privilegio.nombre)}
                        >
                          Desmarcar todo
                        </p>
                        <p
                          className={`cierre-privilegios ${estanTodosMarcados(privilegiosElegidos, privilegio) ? 'desactivado' : ''}`}
                          onClick={() => !estanTodosMarcados(privilegiosElegidos, privilegio) && marcarTarea(privilegio.nombre, privilegio.permisos)}
                        >
                          Marcar todo
                        </p>
                      </div>
                      <h4 className="privilegio-titulo" style={{ fontSize: '18px' }}>Tarea: {privilegio.nombre}</h4>
                      <div className="permisos-container">
                        {privilegio.permisos && privilegio.permisos.map((permiso, permisoIndex) => (
                          <div key={permisoIndex}>
                            <input
                              type="checkbox"
                              value={permiso}
                              checked={privilegiosElegidos[privilegio.nombre]?.includes(permiso) || false}
                              onChange={() => handleModificarPrivilegios(privilegio.nombre, permiso)}
                            />
                            <label>{permiso}</label>
                          </div>
                        ))}
                      </div>

                      <hr />
                    </>
                  )}
                </div>
              ))}
            </div>

            <hr />
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>
              <button className='btn-accion-completar' onClick={editarEmpleado} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Editar empleado ✓'}
              </button>
            </div>
          </>
        )
    }
  }

  return (
    <div className="modal-info">
      <h2>&mdash; Agregar empleado &mdash;</h2>
      <Toaster />
      {renderStep()}
    </div>
  )
}

export default EditarEmpleado;

