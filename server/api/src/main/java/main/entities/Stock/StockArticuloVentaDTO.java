package main.entities.Stock;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.entities.Ingredientes.EnumMedida;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class StockArticuloVentaDTO extends Stock {
    private Long id;
    private String nombreArticulo;

    public StockArticuloVentaDTO(double precioCompra, int cantidadActual, int cantidadMinima, int cantidadMaxima, EnumMedida medida, Long id1, String nombreArticulo) {
        super(precioCompra, cantidadActual, cantidadMinima, cantidadMaxima, medida);
        this.id = id1;
        this.nombreArticulo = nombreArticulo;
    }
}