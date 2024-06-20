import { useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import '../styles/modalFlotante.css'
import '../styles/modalCrud.css'
import ModalCrud from "../components/ModalCrud";
import AgregarSubcategoria from "../components/Subcategorias/AgregarSubcategoria";
import { Roles } from "../types/Restaurante/Roles";
import { RolesService } from "../services/RolesService";

const ModalFlotanteRecomendacionesRoles: React.FC<{ onCloseModal: () => void, onSelectRol: (rol: Roles) => void, datosOmitidos: string[] }> = ({ onSelectRol, onCloseModal, datosOmitidos }) => {
  const handleModalClose = () => {
    setRecomendaciones([])
    setRecomendacionesFiltradas([])
    onCloseModal();
  };

  const handleModalAddSubClose = () => {
    setShowAgregarSubcategoriaModal(false)
  };

  const [recomendaciones, setRecomendaciones] = useState<Roles[]>([]);
  const [recomendacionesFiltradas, setRecomendacionesFiltradas] = useState<Roles[]>([]);

  const [showAgregarSubcategoriaModal, setShowAgregarSubcategoriaModal] = useState(false);

  useEffect(() => {
    RolesService.getRoles()
      .then(roles => {
        if (datosOmitidos?.length > 0) {
          const rolesFiltrados = roles.filter(rol =>
            !datosOmitidos.includes(rol.nombre)
          );
          setRecomendaciones(rolesFiltrados);
          setRecomendacionesFiltradas(rolesFiltrados);
        } else {
          setRecomendaciones(roles);
          setRecomendacionesFiltradas(roles);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  function filtrarRecomendaciones(filtro: string) {
    if (filtro.length > 0) {
      setRecomendacionesFiltradas(recomendaciones.filter(recomendacion => recomendacion.nombre.toLowerCase().includes(filtro.toLowerCase())));
    } else {
      setRecomendacionesFiltradas(recomendaciones);
    }
  }

  return (
    <div>
      <div className="modal-overlay">

        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

          <button className="modal-close" onClick={handleModalClose}><CloseIcon /></button>
          <h2>&mdash; Filtrar roles &mdash;</h2>
          <div className="btns-stock">
            <button onClick={() => setShowAgregarSubcategoriaModal(true)}>Cargar un nuevo rol</button>
          </div>
          <ModalCrud isOpen={showAgregarSubcategoriaModal} onClose={handleModalAddSubClose}>
            <AgregarSubcategoria onCloseModal={handleModalClose} />
          </ModalCrud>
          <hr />
          <div className="inputBox">
            <input type="text" required onChange={(e) => filtrarRecomendaciones(e.target.value)} />
            <span>Filtrar por nombre...</span>
          </div>
          <table className="tabla-recomendaciones">
            <thead>
              <tr>
                <th>NOMBRE</th>
              </tr>
            </thead>
            <tbody>
              {recomendacionesFiltradas && recomendacionesFiltradas.length > 0 ? (
                recomendacionesFiltradas.map(recomendacion => (
                  <tr key={recomendacion.id} style={{ cursor: 'pointer' }} onClick={() => onSelectRol(recomendacion)}>
                    <td>{recomendacion.nombre}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>No se encontraron datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModalFlotanteRecomendacionesRoles;