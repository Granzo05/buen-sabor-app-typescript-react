package main.repositories;

import main.entities.Ingredientes.Ingrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface IngredienteRepository extends JpaRepository<Ingrediente, Long> {
    @Query("SELECT i FROM Ingrediente i JOIN i.sucursales s WHERE i.nombre = :nombre AND s.id = :idSucursal")
    Optional<Ingrediente> findByNameAndIdSucursal(@Param("nombre") String nombre, @Param("idSucursal") Long idSucursal);

    @Query("SELECT i FROM Ingrediente i JOIN i.sucursales s WHERE s.id = :idIngrediente")
    List<Ingrediente> findAllByIdSucursal(@Param("idIngrediente") Long idIngrediente);

    @Query("SELECT i FROM Ingrediente i JOIN i.sucursales s WHERE s.id = :idIngrediente AND i.borrado = 'NO'")
    List<Ingrediente> findAllByIdSucursalNotBorrado(@Param("idIngrediente") Long idIngrediente);

    @Query("SELECT i FROM Ingrediente i JOIN i.sucursales s WHERE i.id = :idIngrediente AND s.id = :idSucursal")
    Optional<Ingrediente> findByIdIngredienteAndIdSucursal(@Param("idSucursal") Long idSucursal, @Param("idIngrediente") Long idIngrediente);

}