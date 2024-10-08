import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner'
import { SucursalService } from '../../services/SucursalService';
import { Sucursal } from '../../types/Restaurante/Sucursal';
import { Empresa } from '../../types/Restaurante/Empresa';
import { Roles } from '../../types/Restaurante/Roles';
import { RolesService } from '../../services/RolesService';

interface EditarMedidaProps {
  rolOriginal: Roles;
  onCloseModal: () => void;
}

const EditarMedida: React.FC<EditarMedidaProps> = ({ rolOriginal, onCloseModal }) => {

  const [nombre, setNombre] = useState(rolOriginal.nombre);
  const [isLoading, setIsLoading] = useState(false);

  function editarMedida() {
    const rol: Roles = rolOriginal;
    rol.borrado = rolOriginal.borrado;

    if (!nombre) {
      toast.info("Por favor, asigne un nombre válido");
      return;
    }
    setIsLoading(true);

    rol.nombre = nombre;

    let sucursalesElegidas: Sucursal[] = [];

    idsSucursalesElegidas.forEach(idSucursal => {
      let sucursal: Sucursal = new Sucursal();
      sucursal.id = idSucursal;
      sucursalesElegidas.push(sucursal);
    });

    rol.sucursales = sucursalesElegidas;

    toast.promise(RolesService.updateRol(rol), {
      loading: 'Editando rol...',
      success: (message) => {
        setTimeout(() => {
          onCloseModal();
        }, 800);
        return "Rol actualizado correctamente!";
      },
      error: (message) => {
        return message;
      },
    });
  }

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

  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div >
              <Toaster />
              <div className="modal-info">

                <Toaster />
                <div className="inputBox">
                  <input type="text" required={true} value={nombre} onChange={(e) => { setNombre(e.target.value) }} />
                  <span>Nombre del rol</span>
                  <div className="error-message">El nombre debe contener letras y espacios.</div>
                </div>
              </div>
              <div className="btns-pasos">
                {empresa && empresa?.id > 0 ? (
                  <button className='btn-accion-adelante' onClick={nextStep}>Seleccionar sucursales ⭢</button>
                ) : (
                  <button className='btn-accion-completar' onClick={editarMedida} disabled={isLoading}>
                    {isLoading ? 'Cargando...' : 'Editar rol ✓'}
                  </button>)}
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h4>Sucursales</h4>
            {sucursales && sucursales.map((sucursal, index) => (
              <div key={index}>
                <>
                  <hr />
                  <p className='cierre-ingrediente' onClick={() => desmarcarSucursales()}>Desmarcar todas</p>
                  <p className='cierre-ingrediente' onClick={() => marcarSucursales()}>Marcar todas</p>
                  <h4 style={{ fontSize: '18px' }}>Sucursal: {sucursal.nombre}</h4>
                  <input
                    type="checkbox"
                    value={sucursal.id}
                    checked={idsSucursalesElegidas.has(sucursal.id) || false}
                    onChange={() => handleSucursalesElegidas(sucursal.id)}
                  />
                  <label>{sucursal.nombre}</label>
                </>
              </div>
            ))}
            <div className="btns-pasos">
              <button className='btn-accion-atras' onClick={prevStep}>⭠ Atrás</button>
              <button className='btn-accion-completar' onClick={editarMedida} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Editar rol ✓'}
              </button>
            </div>
          </>
        );
    }
  }

  return (
    <div className="modal-info">
      <h2>&mdash; Editar rol &mdash;</h2>
      <Toaster />
      {renderStep()}
    </div >
  );
}


export default EditarMedida
