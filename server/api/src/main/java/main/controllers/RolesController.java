package main.controllers;

import jakarta.transaction.Transactional;
import main.entities.Restaurante.Roles;
import main.entities.Restaurante.Sucursal;
import main.repositories.RolesRepository;
import main.repositories.SucursalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@RestController
public class RolesController {
    private final RolesRepository rolesRepository;
    private final SucursalRepository sucursalRepository;

    public RolesController(RolesRepository rolesRepository, SucursalRepository sucursalRepository) {
        this.rolesRepository = rolesRepository;
        this.sucursalRepository = sucursalRepository;
    }


    @CrossOrigin
    @GetMapping("/roles/{idSucursal}")
    public Set<Roles> getRoles(@PathVariable("idSucursal") Long idSucursal) {
        return new HashSet<>(rolesRepository.findAllByIdSucursal(idSucursal));
    }

    @CrossOrigin
    @GetMapping("/roles/disponibles/{idSucursal}")
    public Set<Roles> getRolesDisponibles(@PathVariable("idSucursal") Long idSucursal) {
        return new HashSet<>(rolesRepository.findAllByIdSucursalNotBorrado(idSucursal));
    }

    @CrossOrigin
    @Transactional
    @PostMapping("/roles/create/{idSucursal}")
    public ResponseEntity<String> crearRol(@RequestBody Roles rolDetails, @PathVariable("idSucursal") Long idSucursal) {
        // Busco el rol en la base de datos
        Optional<Roles> rolesDB = rolesRepository.findByDenominacionAndIdSucursal(rolDetails.getNombre(), idSucursal);

        if (rolesDB.isEmpty()) {

            rolDetails.setBorrado("NO");

            if (!rolDetails.getSucursales().isEmpty()) {
                Set<Sucursal> sucursales = new HashSet<>(rolDetails.getSucursales());
                for (Sucursal sucursalVacia : sucursales) {
                    Sucursal sucursal = sucursalRepository.findById(sucursalVacia.getId()).get();

                    rolDetails.getSucursales().add(sucursal);

                    rolDetails = rolesRepository.save(rolDetails);

                    sucursal.getRoles().add(rolDetails);
                    sucursal.setBorrado("NO");

                    sucursalRepository.save(sucursal);
                }
            } else {
                Optional<Sucursal> sucursalOpt = sucursalRepository.findById(idSucursal);
                if (sucursalOpt.isPresent()) {
                    Sucursal sucursal = sucursalOpt.get();
                    if (!sucursal.getMedidas().contains(rolDetails)) {
                        rolDetails.getSucursales().add(sucursal);

                        rolDetails = rolesRepository.save(rolDetails);

                        sucursal.getRoles().add(rolDetails);
                        sucursal.setBorrado("NO");

                        sucursalRepository.save(sucursal);
                    }
                } else {
                    return new ResponseEntity<>("Sucursal no encontrada con id: " + idSucursal, HttpStatus.NOT_FOUND);
                }
            }


            return new ResponseEntity<>("El rol ha sido añadido correctamente", HttpStatus.CREATED);
        }

        return ResponseEntity.badRequest().body("Hay una rol existente con ese nombre");
    }

    @CrossOrigin
    @Transactional
    @PutMapping("/rol/update/{idSucursal}")
    public ResponseEntity<String> actualizarRol(@RequestBody Roles rol, @PathVariable("idSucursal") Long idSucursal) {
        Optional<Roles> rolDB = rolesRepository.findByIdRolAndIdSucursal(rol.getId(), idSucursal);

        if (rolDB.isEmpty()) {
            return ResponseEntity.ofNullable("La rol no existe");
        } else {
            Optional<Roles> rolEncontrado = rolesRepository.findByDenominacionAndIdSucursal(rol.getNombre(), idSucursal);

            if (rolEncontrado.isPresent() && rolEncontrado.get().getId() != rolDB.get().getId()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Existe una rol con ese nombre");
            }

            rolDB.get().setNombre(rol.getNombre());
            rolDB.get().setBorrado(rol.getBorrado());
            rolesRepository.save(rolDB.get());
            return ResponseEntity.ok("Medida actualizada correctamente");
        }
    }
}
