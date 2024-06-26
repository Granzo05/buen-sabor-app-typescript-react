import { sucursalId, URL_API } from "../utils/global_variables/const";

export const ReportesServices = {
    getPedidosGraficoBarraIngresos: async (fechaDesde: string, fechaHasta: string) => {
        const fechaDesdeFormatted = fechaDesde.replace(/-/g, 'N');
        const fechaHastaFormatted = fechaHasta.replace(/-/g, 'N');

        const response = await fetch(URL_API + `pedidos/${fechaDesdeFormatted}/${fechaHastaFormatted}/datachartbar/ingresos/` + sucursalId(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: 'cors'
        });
        return await response.json();
    },

    getPedidosGraficoBarraGanancias: async (fechaDesde: string, fechaHasta: string) => {
        const fechaDesdeFormatted = fechaDesde.replace(/-/g, 'N');
        const fechaHastaFormatted = fechaHasta.replace(/-/g, 'N');

        const response = await fetch(URL_API + `pedidos/${fechaDesdeFormatted}/${fechaHastaFormatted}/datachartbar/ganancias/` + sucursalId(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: 'cors'
        });
        return await response.json();
    },

    getPedidosGraficoBarraPedidosCliente: async (idCliente: number, fechaDesde: string, fechaHasta: string) => {
        const fechaDesdeFormatted = fechaDesde.replace(/-/g, 'N');
        const fechaHastaFormatted = fechaHasta.replace(/-/g, 'N');

        const response = await fetch(URL_API + `pedidos/cliente/${idCliente}/${fechaDesdeFormatted}/${fechaHastaFormatted}/datachartbar/ganancias/` + sucursalId(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: 'cors'
        });
        return await response.json();
    },

    getPedidosGraficoBarraComidas: async (fechaDesde: string, fechaHasta: string) => {
        const fechaDesdeFormatted = fechaDesde.replace(/-/g, 'N');
        const fechaHastaFormatted = fechaHasta.replace(/-/g, 'N');

        const response = await fetch(URL_API + `pedidos/${fechaDesdeFormatted}/${fechaHastaFormatted}/datachartbar/comidas/` + sucursalId(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: 'cors'
        });
        return await response.json();
    },

    getExcelPedidos: async (fechaDesde: string, fechaHasta: string) => {
        const fechaDesdeFormatted = fechaDesde.replace(/-/g, 'N');
        const fechaHastaFormatted = fechaHasta.replace(/-/g, 'N');

        const response = await fetch(URL_API + `downloadExcelPedidos/${sucursalId()}/${fechaDesdeFormatted}/${fechaHastaFormatted}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'pedidos.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    },

}