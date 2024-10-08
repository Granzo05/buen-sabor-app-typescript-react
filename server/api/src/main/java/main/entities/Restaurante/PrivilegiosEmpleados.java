package main.entities.Restaurante;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "privilegios_empleados")
public class PrivilegiosEmpleados extends Privilegios {

    @JsonIgnoreProperties(value = {"domicilios", "imagenes", "privilegios", "rolesEmpleado", "sucursales", "fechaContratacion"}, allowSetters = true)
    @ManyToMany(mappedBy = "privilegios", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Empleado> empleados = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "permisos_empleados", joinColumns = @JoinColumn(name = "id_privilegio"))
    @Column(name = "permiso")
    private List<String> permisos = new ArrayList<>();
}