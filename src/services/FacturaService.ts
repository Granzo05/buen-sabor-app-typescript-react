import { Bill } from '../types/Factura'
import { URL_API } from '../utils/global_variables/const';

export const BillService = {

    getBill: async (userId: number): Promise<Bill[]> => {
        const response = await fetch(URL_API + `bills/client/${userId}`)
        const data = await response.json();
        return data;
    },


    getPDFBill: async (orderId: number): Promise<Uint8Array> => {
        // Hacemos la peticion del pdf
        const response = await fetch(`/api/pdf/bill/${orderId}/pdf`);
        // La llamada devuelve un array de bytes, los cuales transformamos para que pueda ser leído
        const byteArray = await response.arrayBuffer();
        return new Uint8Array(byteArray);
      }
}