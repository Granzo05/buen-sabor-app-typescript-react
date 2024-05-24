package main.entities.Stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import main.entities.Ingredientes.Ingrediente;
import main.entities.Ingredientes.Medida;
import main.entities.Productos.ArticuloVenta;

import javax.print.attribute.standard.Media;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "detalle_stock", schema = "buen_sabor")
public class DetalleStock {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "cantidad")
    private int cantidad;
    @OneToOne
    @JoinColumn(name = "id_medida")
    private Medida medida;
    @Column(name = "costo_unitario")
    private double costoUnitario;
    @Column(name = "subtotal")
    private double subTotal;
    @OneToOne
    @JsonIgnoreProperties(value = {"stock"})
    @JoinColumn(name = "id_ingrediente")
    private Ingrediente ingrediente;
    @OneToOne
    @JsonIgnoreProperties(value = {"stock"})
    @JoinColumn(name = "id_articulo")
    private ArticuloVenta articuloVenta;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "id_stock_entrante")
    private StockEntrante stockEntrante;

}
