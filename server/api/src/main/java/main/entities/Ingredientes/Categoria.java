package main.entities.Ingredientes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import main.entities.Productos.Imagenes;
import main.entities.Restaurante.Sucursal;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@ToString
@Table(name = "categorias", schema = "buen_sabor")
public class Categoria implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "borrado")
    private String borrado = "NO";

    @JsonIgnoreProperties(value = {"sucursales", "categoria"}, allowSetters = true)
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL)
    private Set<Subcategoria> subcategorias = new HashSet<>();

    @JsonIgnoreProperties(value = {"articuloMenu", "articuloVenta", "promocion", "empresa", "sucursal", "categoria", "empleados"}, allowSetters = true)
    @ManyToMany(mappedBy = "categorias", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Imagenes> imagenes = new HashSet<>();

    @JsonIgnoreProperties(value = {"domicilios", "empleados", "empresa", "stocksIngredientes", "stocksArticulo", "promociones", "localidadesDisponiblesDelivery", "articulosMenu", "articulosVenta", "medidas", "categorias", "imagenes", "ingredientes", "stocksEntranteSucursal"}, allowSetters = true)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "categorias_sucursales",
            joinColumns = @JoinColumn(name = "id_categoria"),
            inverseJoinColumns = @JoinColumn(name = "id_sucursal")
    )
    private Set<Sucursal> sucursales = new HashSet<>();
}