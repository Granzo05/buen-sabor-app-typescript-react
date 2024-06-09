import { useEffect, useState } from "react";
import ModalCrud from "../ModalCrud";
import { EmpleadoService } from "../../services/EmpleadoService";
import '../../styles/stock.css';
import { Subcategoria } from '../../types/Ingredientes/Subcategoria';
import EliminarSubcategoria from "./EliminarSubcategoria";
import ActivarSubcategoria from "./ActivarSubcategoria";
import EditarSubcategoria from "./EditarSubcategoria";
import AgregarSubcategoria from "./AgregarSubcategoria";
import { CategoriaService } from "../../services/CategoriaService";
import { Categoria } from "../../types/Ingredientes/Categoria";
import React from "react";

const Subcategorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [mostrarCategorias, setMostrarCategorias] = useState(true);

    const [showAgregarModalCategoria, setShowAgregarModalCategoria] = useState(false);
    const [showEditarCategoriaModal, setShowEditarCategoriaModal] = useState(false);
    const [showEliminarCategoriaModal, setShowEliminarCategoriaModal] = useState(false);
    const [showActivarCategoriaModal, setShowActivarCategoriaModal] = useState(false);

    const [selectedCategoria, setSelectedCategoria] = useState<Subcategoria | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await EmpleadoService.checkUser();
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            const data = await CategoriaService.getCategorias();
            setCategorias(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAgregarCategoria = () => {
        setShowEditarCategoriaModal(false);
        setShowEliminarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowAgregarModalCategoria(true);
    };

    const handleEditarCategoria = (subcategoria: Subcategoria) => {
        setSelectedCategoria(subcategoria);
        setShowAgregarModalCategoria(false);
        setShowEliminarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowEditarCategoriaModal(true);
    };

    const handleEliminarCategoria = (subcategoria: Subcategoria) => {
        setSelectedCategoria(subcategoria);
        setShowAgregarModalCategoria(false);
        setShowEditarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowActivarCategoriaModal(false);
        setShowEliminarCategoriaModal(true);
    };

    const handleActivarCategoria = (subcategoria: Subcategoria) => {
        setSelectedCategoria(subcategoria);
        setShowAgregarModalCategoria(false);
        setShowEditarCategoriaModal(false);
        setMostrarCategorias(false);
        setShowActivarCategoriaModal(true);
        setShowEliminarCategoriaModal(false);
    };

    const handleModalClose = () => {
        setShowAgregarModalCategoria(false);
        setShowEditarCategoriaModal(false);
        setShowActivarCategoriaModal(false);
        setShowEliminarCategoriaModal(false);
        fetchCategorias();
        setMostrarCategorias(true);
    };

    return (
        <div className="opciones-pantallas">
            <h1>- Subcategorías -</h1>
            <div className="btns-categorias">
                <button className="btn-agregar" onClick={handleAgregarCategoria}> + Agregar subcategoría</button>
            </div>
            <hr />
            {mostrarCategorias && (
                <div id="stocks">
                    <table>
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Subcategoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.map(categoria => (
                                <React.Fragment key={categoria.id}>
                                    {categoria.subcategorias.map((subcategoria, index) => (
                                        <tr key={subcategoria.id}>
                                            {index === 0 && (
                                                <td rowSpan={categoria.subcategorias.length}>
                                                    {categoria.nombre.toString().replace(/_/g, ' ')}
                                                </td>
                                            )}
                                            <td>{subcategoria.nombre.toString().replace(/_/g, ' ')}</td>
                                            <td>
                                                <div className="btns-acciones">
                                                    <button className="btn-accion-editar" onClick={() => handleEditarCategoria(subcategoria)}>EDITAR</button>
                                                    {subcategoria.borrado === 'NO' ? (
                                                        <button className="btn-accion-eliminar" onClick={() => handleEliminarCategoria(subcategoria)}>ELIMINAR</button>
                                                    ) : (
                                                        <button className="btn-accion-activar" onClick={() => handleActivarCategoria(subcategoria)}>ACTIVAR</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ModalCrud isOpen={showAgregarModalCategoria} onClose={handleModalClose}>
                <AgregarSubcategoria />
            </ModalCrud>

            <ModalCrud isOpen={showEliminarCategoriaModal} onClose={handleModalClose}>
                {selectedCategoria && <EliminarSubcategoria subcategoriaOriginal={selectedCategoria} onCloseModal={handleModalClose} />}
            </ModalCrud>

            <ModalCrud isOpen={showActivarCategoriaModal} onClose={handleModalClose}>
                {selectedCategoria && <ActivarSubcategoria subcategoriaOriginal={selectedCategoria} onCloseModal={handleModalClose} />}
            </ModalCrud>

            <ModalCrud isOpen={showEditarCategoriaModal} onClose={handleModalClose}>
                {selectedCategoria && <EditarSubcategoria subcategoriaOriginal={selectedCategoria} onCloseModal={handleModalClose} />}
            </ModalCrud>
        </div>
    );
};

export default Subcategorias;
