import { useEffect, useState } from "react";
import { EmpleadoService } from "../../services/EmpleadoService";
import AgregarEmpleado from "./AgregarEmpleado";
import Modal from "../Modal";
import { Empleado } from "../../types/Empleado";
import EliminarEmpleado from "./EliminarEmpleado";
import EditarEmpleado from "./EditarEmpleado";

const Empleados = () => {
    EmpleadoService.checkUser('empleado');

    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    const [showAgregarEmpleadoModal, setShowAgregarEmpleadoModal] = useState(false);
    const [showEditarEmpleadoModal, setShowEditarEmpleadoModal] = useState(false);
    const [showEliminarEmpleadoModal, setShowEliminarEmpleadoModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedId, setSelectedId] = useState<number | null>(0);

    useEffect(() => {
        EmpleadoService.getEmpleados()
            .then(data => {
                setEmpleados(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    const handleAgregarEmpleado = () => {
        setShowAgregarEmpleadoModal(true);
    };

    const handleEditarEmpleado = () => {
        setIsEditing(true);
        setShowEditarEmpleadoModal(true);
    };

    const handleEliminarEmpleado = (empleadoId: number) => {
        setSelectedId(empleadoId);
        setShowEliminarEmpleadoModal(true);
    };

    const handleModalClose = () => {
        setShowAgregarEmpleadoModal(false);
        setShowEditarEmpleadoModal(false);
        setIsEditing(false);
    };

    return (
        <div className="opciones-pantallas">
            <h1>Empleados</h1>
            <button onClick={() => handleAgregarEmpleado()}> + Agregar empleado</button>

            <Modal isOpen={showAgregarEmpleadoModal} onClose={handleModalClose}>
                <AgregarEmpleado />
            </Modal>

            <div id="empleados">
                {empleados.map(empleado => (
                    <div key={empleado.id} className='grid-item'>
                        <div className={`datos ${isEditing ? 'hidden' : ''}`}>
                            <h3>{empleado.nombre}</h3>
                            <h3>{empleado.cuit}</h3>
                            <h3>{empleado.telefono}</h3>
                            <h3>{empleado.email}</h3>
                            {empleado.fechaIngreso && (
                                <h3>{empleado.fechaIngreso.toString()}</h3>
                            )}
                            <h3>{empleado.contraseña}</h3>

                            <button onClick={() => handleEliminarEmpleado(empleado.id)}>ELIMINAR</button>
                            <Modal isOpen={showEliminarEmpleadoModal} onClose={handleModalClose}>
                                {selectedId && <EliminarEmpleado empleadoId={selectedId} />}

                            </Modal>
                            <button onClick={() => handleEditarEmpleado()}>EDITAR</button>
                        </div>
                        <Modal isOpen={showEditarEmpleadoModal} onClose={handleModalClose}>
                            <EditarEmpleado empleadoOriginal={empleado} />
                        </Modal>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Empleados