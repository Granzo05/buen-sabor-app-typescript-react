import { StockArticuloVenta } from '../types/Stock/StockArticuloVenta';
import { StockIngredientes } from '../types/Stock/StockIngredientes';
import { sucursalId } from '../utils/global_variables/const';

export const StockArticuloVentaService = {
    createStock: async (stock: StockArticuloVenta): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `sucursal/${sucursalId()}/stockArticuloVenta/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stock)
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

    getStock: async (): Promise<StockArticuloVenta[]> => {
        try {
            const response = await fetch(process.env.URL_API + 'stockArticulos/' + sucursalId(), {
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

    getStockProduct: async (nombre: string, cantidad: number): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `sucursal/${sucursalId()}/stockproduct/${nombre}/${cantidad}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
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

    checkStock: async (idArticulo: number, cantidadNecesaria: number): Promise<boolean> => {
        try {
            const response = await fetch(process.env.URL_API + `sucursal/${sucursalId()}/stockArticulo/check/${idArticulo}/${cantidadNecesaria}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            })
            if (!response.ok) {
                throw new Error(await response.text());
            }

            return await response.json();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    updateStock: async (stock: StockArticuloVenta | StockIngredientes): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `sucursal/${sucursalId()}/stockArticulo/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stock)
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

    reponerStock: async (ingrediente: string, cantidad: number): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `sucursal/${sucursalId()}/stockArticulos/${ingrediente}/cantidad/${cantidad}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }            })
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