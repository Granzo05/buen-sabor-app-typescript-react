package main.entities.Stock;

import jakarta.persistence.*;
import lombok.*;
import main.entities.Productos.ArticuloVenta;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "stock_articulos", schema = "buen_sabor")
public class StockArticuloVenta extends Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @OneToOne
    @JoinColumn(name = "id_articulo")
    private ArticuloVenta articuloVenta;
}