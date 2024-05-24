package main.repositories;

import main.entities.Ingredientes.Categoria;
import main.entities.Productos.ArticuloVenta;
import main.entities.Productos.ArticuloVentaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticuloVentaRepository extends JpaRepository<ArticuloVenta, Long> {
    @Query("SELECT a FROM ArticuloVenta a WHERE a.nombre = :nombre")
    Optional<ArticuloVenta> findByName(@Param("nombre") String nombre);

    @Query("SELECT NEW main.entities.Productos.ArticuloVentaDTO(a.id, a.nombre,a.precioVenta, a.categoria, a.borrado, a.cantidadMedida, a.medida) FROM ArticuloVenta a JOIN a.sucursales s WHERE s.id = :idSucursal ORDER BY a.borrado DESC")
    List<ArticuloVentaDTO> findAllBySucursal(@Param("idSucursal") Long idSucursal);

    @Query("SELECT NEW main.entities.Productos.ArticuloVentaDTO(a.id, a.nombre,a.precioVenta, a.categoria, a.borrado, a.cantidadMedida, a.medida) FROM ArticuloVenta a JOIN a.sucursales s WHERE a.id = :idMenu AND s.id = :idSucursal")
    Optional<ArticuloVentaDTO> findByIdArticuloAndIdSucursalDTO(@Param("idMenu") Long idMenu, @Param("idSucursal") Long idSucursal);

    @Query("SELECT a FROM ArticuloVenta a JOIN a.sucursales s WHERE a.id = :idMenu AND s.id = :idSucursal")
    Optional<ArticuloVenta> findByIdArticuloAndIdSucursal(@Param("idMenu") Long idMenu, @Param("idSucursal") Long idSucursal);

    @Query("SELECT NEW main.entities.Productos.ArticuloVentaDTO(a.id, a.nombre,a.precioVenta, a.categoria, a.borrado, a.cantidadMedida, a.medida) FROM ArticuloVenta a JOIN a.sucursales s WHERE a.categoria = :categoria AND s.id = :idSucursal ORDER BY a.borrado DESC")
    List<ArticuloVentaDTO> findByTipoAndIdSucursal(Categoria categoria, @Param("idSucursal") Long idSucursal);
}