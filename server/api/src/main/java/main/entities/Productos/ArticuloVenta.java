package main.entities.Productos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import main.entities.Ingredientes.EnumMedida;
import main.entities.Restaurante.Sucursal;
import main.entities.Stock.StockArticuloVenta;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "articulos_venta", schema = "buen_sabor")
public class ArticuloVenta extends Articulo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private EnumTipoArticuloVenta tipo;
    @Column(name = "medida")
    private EnumMedida medida;
    @Column(name = "cantidad_medida")
    private int cantidadMedida;
    @JsonIgnoreProperties(value = {"articuloVenta"})
    @OneToOne(mappedBy = "articuloVenta", fetch = FetchType.LAZY)
    private StockArticuloVenta stock;
    @JsonIgnoreProperties(value = {"articuloVenta"})
    @OneToMany(mappedBy = "articuloVenta", fetch = FetchType.LAZY)
    private Set<Imagenes> imagenes = new HashSet<>();
    @Column(name = "borrado")
    private String borrado = "NO";
    @JsonIgnoreProperties(value = {"articulosVenta"})
    @ManyToMany(mappedBy = "articulosVenta", fetch = FetchType.LAZY)
    private Set<Sucursal> sucursales = new HashSet<>();
}
