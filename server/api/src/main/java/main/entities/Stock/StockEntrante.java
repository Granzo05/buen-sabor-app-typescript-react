package main.entities.Stock;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import main.entities.Restaurante.Sucursal;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@ToString
@Table(name = "stock_entrante", schema = "buen_sabor")
public class StockEntrante {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "borrado")
    private String borrado = "NO";

    @Column(name = "estado")
    private String estado = "PENDIENTES";

    @Column(name = "fecha_llegada", nullable = false)
    private LocalDate fechaLlegada;

    @JsonIgnoreProperties(value = {"domicilios", "empleados", "empresa", "stocksIngredientes", "stocksArticulo", "promociones", "localidadesDisponiblesDelivery", "articulosMenu", "articulosVenta", "medidas", "categorias", "imagenes", "ingredientes", "stocksEntranteSucursal"}, allowSetters = true)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "stock_entrante_sucursales",
            joinColumns = @JoinColumn(name = "id_stock_entrante"),
            inverseJoinColumns = @JoinColumn(name = "id_sucursal")
    )
    private Set<Sucursal> sucursales = new HashSet<>();

    @JsonIgnoreProperties(value = {"sucursal", "stockEntrante"}, allowSetters = true)
    @OneToMany(fetch = FetchType.EAGER, orphanRemoval = true, mappedBy = "stockEntrante", cascade = CascadeType.ALL)
    private Set<DetalleStock> detallesStock = new HashSet<>();

}