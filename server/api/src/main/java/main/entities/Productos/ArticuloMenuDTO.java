package main.entities.Productos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.entities.Ingredientes.IngredienteMenuDTO;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ArticuloMenuDTO extends Articulo {
    private Long id;
    private int tiempoCoccion;
    private EnumTipoArticuloComida tipo;
    private int comensales;
    private String descripcion;
    private Set<IngredienteMenuDTO> ingredientesMenu = new HashSet<>();
    private Set<ImagenesProductoDTO> imagenes = new HashSet<>();

    public ArticuloMenuDTO(Long id, String nombre, double precioVenta, int tiempoCoccion, EnumTipoArticuloComida tipo, int comensales, String descripcion) {
        super(nombre, precioVenta);
        this.id = id;
        this.tiempoCoccion = tiempoCoccion;
        this.tipo = tipo;
        this.comensales = comensales;
        this.descripcion = descripcion;
    }
}