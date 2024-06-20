package main.controllers;

import main.entities.Productos.ArticuloVenta;
import main.entities.Restaurante.Sucursal;
import main.entities.Stock.StockArticuloVenta;
import main.entities.Stock.StockEntrante;
import main.entities.Stock.StockIngredientes;
import main.repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.print.Pageable;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
public class StockArticulosController {
    private final StockArticuloVentaRepository stockArticuloRepository;
    private final IngredienteRepository ingredienteRepository;
    private final ArticuloVentaRepository articuloVentaRepository;
    private final SucursalRepository sucursalRepository;
    private final MedidaRepository medidaRepository;
    private final StockEntranteRepository stockEntranteRepository;

    public StockArticulosController(StockArticuloVentaRepository stockArticuloRepository, IngredienteRepository ingredienteRepository, ArticuloVentaRepository articuloVentaRepository, SucursalRepository sucursalRepository, MedidaRepository medidaRepository, StockEntranteRepository stockEntranteRepository) {
        this.stockArticuloRepository = stockArticuloRepository;
        this.ingredienteRepository = ingredienteRepository;
        this.articuloVentaRepository = articuloVentaRepository;
        this.sucursalRepository = sucursalRepository;
        this.medidaRepository = medidaRepository;
        this.stockEntranteRepository = stockEntranteRepository;
    }

    @CrossOrigin
    @GetMapping("/stockArticulos/{idSucursal}")
    public Set<StockArticuloVenta> getStock(@PathVariable("idSucursal") Long id) {
        List<StockArticuloVenta> stocks = stockArticuloRepository.findAllByIdSucursal(id);

        Set<StockArticuloVenta> stocksCargados = new HashSet<>();

        for (StockArticuloVenta stock : stocks) {
            // Busco el stock entrante más cercano en cuanto a fechaLlegada
            PageRequest pageable = PageRequest.of(0, 1);
            Page<StockEntrante> stockEntrante = stockEntranteRepository.findByIdArticuloAndIdSucursal(stock.getArticuloVenta().getId(), id, pageable);

            if (!stockEntrante.isEmpty()) {
                stock.setFechaLlegadaProxima(stockEntrante.get().toList().get(0).getFechaLlegada());
            }

            if (stock.getCantidadActual() > 0 && stock.getCantidadMinima() > 0 && stock.getCantidadMinima() > 0) stocksCargados.add(stock);
        }

        return stocksCargados;
    }

    @CrossOrigin
    @GetMapping("/sucursal/{idSucursal}/stockArticulo/check/{idArticulo}/{cantidadNecesaria}")
    public boolean checkStock(@PathVariable("idArticulo") long idArticulo, @PathVariable("idSucursal") long idSucursal, @PathVariable("cantidadNecesaria") int cantidad) {
        // True hay stock, false no
        Optional<StockArticuloVenta> stockArticuloVenta = stockArticuloRepository.findByIdAndIdSucursal(idArticulo, idSucursal);

        if (stockArticuloVenta.isPresent()) {
            // Si el stock actual es menor a la cantidad, o descontando la cantidad el stock es 0
            if (stockArticuloVenta.get().getCantidadActual() < cantidad || stockArticuloVenta.get().getCantidadActual() - cantidad <= 0) {
                return false;
            }
        }

        return true;
    }


    @CrossOrigin
    @PostMapping("/sucursal/{idSucursal}/stockArticuloVenta/create")
    public ResponseEntity<String> crearStock(@RequestBody StockArticuloVenta stockDetail, @PathVariable("idSucursal") long id) {
        Optional<ArticuloVenta> articuloDB = articuloVentaRepository.findByName(stockDetail.getArticuloVenta().getNombre());

        if (articuloDB.isPresent()) {
            // Busco el ingrediente en la base de datos
            Optional<StockArticuloVenta> stockArticuloDB = stockArticuloRepository.findStockByProductNameAndIdSucursal(stockDetail.getArticuloVenta().getNombre(), id);

            // Si no hay stockArticuloVenta del producto cargado, entonces creamos uno nuevo. Caso contrario utilizamos y editamos el que ya está cargado en la base de datos
            if (stockArticuloDB.isEmpty()) {
                ArticuloVenta articulo = articuloVentaRepository.findByName(stockDetail.getArticuloVenta().getNombre()).get();

                stockDetail.setArticuloVenta(articulo);

                articulo.setStockArticuloVenta(stockDetail);

                Sucursal sucursal = sucursalRepository.findById(id).get();

                stockDetail.getSucursales().add(sucursal);

                if (stockDetail.getMedida().getNombre().isEmpty()) {
                    stockDetail.setMedida(medidaRepository.findById(1l).get());
                }

                stockDetail.setBorrado("NO");

                stockArticuloRepository.save(stockDetail);

                return new ResponseEntity<>("El stockArticuloVenta ha sido añadido correctamente", HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("El stock ya existe", HttpStatus.FOUND);
            }
        } else {
            return ResponseEntity.badRequest().body("No existe ningun articulo con ese nombre, debe crearlo antes de asignarle un stock");
        }
    }

    @CrossOrigin
    @PutMapping("sucursal/{idSucursal}/stockArticulos/{articulo}/cantidad/{cantidad}")
    public ResponseEntity<String> reponerStock(@PathVariable("articulo") String nombreArticulo, @PathVariable("cantidad") int cantidad, @PathVariable("idSucursal") long id) {
        // Busco el stockIngredientes de ese ingrediente
        Optional<StockArticuloVenta> stockEncontrado = stockArticuloRepository.findByArticuloNameAndIdSucursal(nombreArticulo, id);

        if (stockEncontrado.isPresent()) {
            StockArticuloVenta stock = stockEncontrado.get();

            stock.setCantidadActual(stock.getCantidadActual() + cantidad);

            stockArticuloRepository.save(stock);
            return ResponseEntity.ok("El stock ha sido actualizado correctamente");
        }

        return ResponseEntity.ofNullable("El stock no existe o está desactivado");
    }

    @CrossOrigin
    @PutMapping("sucursal/{idSucursal}/stockArticulo/update")
    public ResponseEntity<String> actualizarStock(@RequestBody StockArticuloVenta stockArticuloVenta, @PathVariable("idSucursal") long id) {
        // Busco el stockIngredientes de ese ingrediente
        Optional<StockArticuloVenta> stockEncontrado = stockArticuloRepository.findByIdAndIdSucursal(stockArticuloVenta.getId(), id);

        if (stockEncontrado.isPresent() && stockEncontrado.get().getBorrado().equals(stockArticuloVenta.getBorrado())) {
            StockArticuloVenta stock = stockEncontrado.get();

            stock.setCantidadMinima(stockArticuloVenta.getCantidadMinima());
            stock.setCantidadMaxima(stockArticuloVenta.getCantidadMaxima());
            stock.setCantidadActual(stockArticuloVenta.getCantidadActual());
            stock.setPrecioCompra(stockArticuloVenta.getPrecioCompra());
            stock.setMedida(stockArticuloVenta.getMedida());

            stockArticuloRepository.save(stock);
            return ResponseEntity.ok("El stock ha sido actualizado correctamente");
        } else if (stockEncontrado.isPresent() && !stockEncontrado.get().getBorrado().equals(stockArticuloVenta.getBorrado())) {
            StockArticuloVenta stock = stockEncontrado.get();

            stock.setBorrado(stockArticuloVenta.getBorrado());

            stockArticuloRepository.save(stock);
            return ResponseEntity.ok("El stock ha sido actualizado correctamente");

        }

        return ResponseEntity.ofNullable("El stock no existe o está desactivado");
    }

}
