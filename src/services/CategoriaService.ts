import { Categoria } from '../types/Ingredientes/Categoria';
import { Imagenes } from '../types/Productos/Imagenes';
import { sucursalId } from '../utils/global_variables/const';

export const CategoriaService = {
    getCategorias: async (): Promise<Categoria[]> => {
        try {
            const response = await fetch(process.env.URL_API + 'categorias/' + sucursalId(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`Error al obtener datos(${response.status}): ${response.statusText}`);
            }
            return await response.json();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    getCategoriasNoBorradas: async (): Promise<Categoria[]> => {
        try {
            const response = await fetch(process.env.URL_API + 'categorias/disponibles/' + sucursalId(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`Error al obtener datos(${response.status}): ${response.statusText}`);
            }
            return await response.json();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    createCategoria: async (categoria: Categoria, imagenes: Imagenes[]): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + 'categoria/create/' + sucursalId(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoria)
            })

            let cargarImagenes = true;

            if (!response.ok) {
                cargarImagenes = false;
                throw new Error(await response.text());
            }

            // Cargar imágenes solo si se debe hacer
            if (cargarImagenes) {
                await Promise.all(imagenes.map(async (imagen: Imagenes) => {
                    if (imagen.file) {
                        // Crear objeto FormData para las imágenes
                        const formData = new FormData();
                        formData.append('file', imagen.file);
                        formData.append('nombreCategoria', categoria.nombre);

                        await fetch(process.env.URL_API + 'categoria/imagenes/' + sucursalId(), {
                            method: 'POST',
                            body: formData
                        });
                    }
                }));
            }

            return await response.text();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    updateCategoria: async (categoria: Categoria, imagenes: Imagenes[], imagenesEliminadas: Imagenes[]): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + 'categoria/update/' + sucursalId(), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoria)
            })

            let cargarImagenes = true;

            if (!response.ok) {
                cargarImagenes = false;
                throw new Error(await response.text());
            }

            // Cargar imágenes solo si se debe hacer
            if (cargarImagenes && imagenes) {
                await Promise.all(imagenes.map(async (imagen) => {
                    if (imagen.file) {
                        // Crear objeto FormData para las imágenes
                        const formData = new FormData();
                        formData.append('file', imagen.file);
                        formData.append('nombreCategoria', categoria.nombre);

                        await fetch(process.env.URL_API + 'categoria/imagenes/' + sucursalId(), {
                            method: 'POST',
                            body: formData
                        });
                    }
                }));
            }

            if (cargarImagenes && imagenesEliminadas) {
                await Promise.all(imagenesEliminadas.map(async (imagen) => {
                    await fetch(process.env.URL_API + 'categoria/imagen/' + imagen.id + '/delete', {
                        method: 'PUT',
                    });
                }));
            }

            return await response.text();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    updateCategoriaBorrado: async (categoria: Categoria): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + 'categoria/update/' + sucursalId(), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoria)
            })

            if (!response.ok) {
                throw new Error(await response.text());
            }

            return await response.text();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
}