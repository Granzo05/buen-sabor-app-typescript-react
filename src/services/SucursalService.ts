import { Imagenes } from '../types/Productos/Imagenes';
import { Sucursal } from '../types/Restaurante/Sucursal';
import { URL_API } from '../utils/global_variables/const';

export const SucursalService = {
    createRestaurant: async (sucursal: Sucursal, imagenes: Imagenes[]): Promise<string> => {
        try {
            const response = await fetch(URL_API + 'sucursal/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sucursal)
            })

            if (!response.ok) {
                throw new Error(await response.text());
            }

            let cargarImagenes = true;

            // Cargar imágenes solo si se debe hacer
            if (cargarImagenes) {
                await Promise.all(imagenes.map(async (imagen) => {
                    if (imagen.file) {
                        // Crear objeto FormData para las imágenes
                        const formData = new FormData();
                        formData.append('file', imagen.file);
                        formData.append('nombreSucursal', sucursal.nombre);

                        await fetch(URL_API + 'sucursal/imagenes/', {
                            method: 'POST',
                            body: formData
                        });
                    }
                }));
            }

            return await response.text();

        } catch (error) {
            console.error('Error:', error);
            throw new Error('Credenciales inválidas');
        }
    },

    getSucursal: async (email: string, contraseña: string): Promise<string> => {
        try {
            const response = await fetch(URL_API + 'sucursal/login/' + email + '/' + contraseña, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }

            const data = await response.json();

            if (data.id === null) {
                throw new Error('Credenciales inválidas');
            } else {
                let restaurante = {
                    id: data.id,
                    email: data.email,
                    telefono: data.telefono,
                    privilegios: data.privilegios
                }

                localStorage.setItem('usuario', JSON.stringify(restaurante));

                return 'Sesión iniciada correctamente';
            }
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Credenciales inválidas');
        }
    },



    getSucursales: async (): Promise<Sucursal[]> => {
        try {
            const response = await fetch(URL_API + 'sucursales', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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

    getSucursalById: async (idSucursal: number): Promise<Sucursal | null> => {
        try {
            const response = await fetch(URL_API + 'sucursal/' + idSucursal, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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

    updateRestaurant: async (sucursal: Sucursal, imagenes: Imagenes[], imagenesEliminadas: Imagenes[]) => {
        try {
            const response = await fetch(URL_API + 'sucursal/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sucursal)
            })
            if (!response.ok) {
                throw new Error(`Error al obtener datos(${response.status}): ${response.statusText}`);
            }

            let cargarImagenes = true;

            // Cargar imágenes solo si se debe hacer
            if (cargarImagenes && (imagenes || imagenesEliminadas)) {
                await Promise.all(imagenes.map(async (imagen) => {
                    if (imagen.file) {
                        // Crear objeto FormData para las imágenes
                        const formData = new FormData();
                        formData.append('file', imagen.file);
                        formData.append('nombreSucursal', sucursal.nombre);

                        await fetch(URL_API + 'sucursal/imagenes/', {
                            method: 'POST',
                            body: formData
                        });
                    }
                }));

                if (imagenesEliminadas) {
                    await Promise.all(imagenesEliminadas.map(async (imagen) => {
                        await fetch(URL_API + 'sucursal/imagen/' + imagen.id + '/delete', {
                            method: 'PUT',
                        });
                    }));
                }
            }

            return await response.text();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
}