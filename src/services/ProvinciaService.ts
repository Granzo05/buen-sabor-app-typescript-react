import { Provincia } from '../types/Domicilio/Provincia';

export const ProvinciaService = {
    getProvincias: async (): Promise<Provincia[] | []> => {
        try {
            const response = await fetch(process.env.URL_API + `provincias`, {
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
}