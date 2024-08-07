import { Cliente } from '../types/Cliente/Cliente';
import { EnumEstadoPedido } from '../types/Pedidos/EnumEstadoPedido';
import { Pedido } from '../types/Pedidos/Pedido'
import { PreferenceMP } from '../types/Pedidos/PreferenceMP';
import { sucursalId } from '../utils/global_variables/const';
import { FacturaService } from './FacturaService';

export const PedidoService = {
    getPedidosClientes: async (): Promise<Pedido[] | null> => {
        const clienteString = localStorage.getItem('usuario');
        let cliente: Cliente = clienteString ? JSON.parse(clienteString) : new Cliente();

        if (!cliente) {
            window.location.href = '/acceso-denegado';
        } else {
            try {
                const response = await fetch(process.env.URL_API + `cliente/${cliente.id}/pedidos`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                if (!response.ok) {
                    throw new Error(`Error al obtener datos(${response.status}): ${response.statusText}`);
                }

                const data = await response.json();

                return data;


            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        }

        return null;
    },

    getTopComidas: async (fechaInicio: string, fechaFin: string): Promise<any[]> => {
        try {
            const response = await fetch(process.env.URL_API + `api/top-comidas/${fechaInicio}/${fechaFin}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener datos(${response.status}): ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    getPedidos: async (estado: EnumEstadoPedido): Promise<Pedido[]> => {
        try {
            const response = await fetch(process.env.URL_API + `pedidos/${estado}/${sucursalId()}`, {
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

    crearPedido: async (pedido: Pedido): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `pedido/create/${sucursalId()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
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

    crearPedidoMercadopago: async (pedido: Pedido): Promise<PreferenceMP> => {
        try {
            const response = await fetch(`${process.env.URL_API}pedido/create/mercadopago/${sucursalId()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            return await response.json();

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },


    updateEstadoPedido: async (pedido: Pedido, estado: EnumEstadoPedido): Promise<string> => {
        pedido.estado = estado;

        // La factura solo se crea cuando el producto ha sido entregado
        if (pedido.estado === EnumEstadoPedido.ENTREGADOS) {
            await FacturaService.crearFactura(pedido);
        }

        try {
            const response = await fetch(process.env.URL_API + 'pedido/update/estado/' + sucursalId(), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
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

    updateEstadoPedidoMercadopago: async (idPedido: number, preference: string): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `pedido/${idPedido}/update/${preference}/${sucursalId()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
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


    eliminarPedidoFallido: async (preference: string): Promise<string> => {
        try {
            const response = await fetch(process.env.URL_API + `pedido/delete/${preference}/${sucursalId()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
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