import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmpleadoService } from '../../services/EmpleadoService';
import '../../styles/empleados.css';
import { Toaster, toast } from 'sonner'
import { Empleado } from '../../types/Restaurante/Empleado';

interface EliminarEmpleadoProps {
  empleadoOriginal: Empleado;
}

const EliminarEmpleado: React.FC<EliminarEmpleadoProps> = ({ empleadoOriginal }) => {
  const navigate = useNavigate();

  const onConfirm = () => {
    toast.promise(EmpleadoService.updateEmpleado(empleadoOriginal), {
      loading: 'Eliminando empleado...',
      success: (message) => {
        return message;
      },
      error: (message) => {
        return message;
      },
    });
  };

  const onCancel = () => {
    navigate('/opciones');
  };

  return (
    <div>
      <Toaster />
      <p>¿Seguro que quieres eliminar el empleado?</p>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <button onClick={onConfirm}>Confirmar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

export default EliminarEmpleado;
