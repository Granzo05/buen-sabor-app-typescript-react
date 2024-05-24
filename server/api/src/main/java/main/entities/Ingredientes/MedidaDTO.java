package main.entities.Ingredientes;

import jakarta.persistence.*;
import lombok.*;
import main.entities.Restaurante.Sucursal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MedidaDTO {
    private Long id;
    private String nombre;
    private String borrado = "NO";

    public MedidaDTO(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }
}