package main.controllers;

import jakarta.transaction.Transactional;
import main.entities.Restaurante.Menu.Ingrediente;
import main.entities.Restaurante.Menu.IngredienteMenu;
import main.entities.Restaurante.Menu.Menu;
import main.entities.Restaurante.Menu.Stock;
import main.entities.Restaurante.Restaurante;
import main.repositories.IngredienteRepository;
import main.repositories.RestauranteRepository;
import main.repositories.StockRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class StockController {
    private final RestauranteRepository restauranteRepository;
    private final StockRepository stockRepository;
    private final IngredienteRepository ingredienteRepository;

    public StockController(RestauranteRepository restauranteRepository,
                           StockRepository stockRepository, IngredienteRepository ingredienteRepository) {
        this.restauranteRepository = restauranteRepository;
        this.stockRepository = stockRepository;
        this.ingredienteRepository = ingredienteRepository;
    }

    @GetMapping("/stock")
    public List<Stock> getStock() {
        List<Stock> stock = stockRepository.findAll();
        if (stock.isEmpty()) {
            return null;
        }

        return stock;
    }


    @GetMapping("/stock/{nombre}")
    public ResponseEntity<Stock> getStockPorNombre(@PathVariable String nombre) {
        Optional<Stock> stockEncontrado = stockRepository.findStockByProductName(nombre);
        if (stockEncontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Stock stock = stockEncontrado.get();
        return ResponseEntity.ok(stock);
    }

    // Busca stock mediante el menu, utilizando cada ingrediente para corroborar que hay cantidad para cocinar
    @GetMapping("/restaurant/stock/check")
    public ResponseEntity<String> checkStock(@RequestParam(value = "menus") List<Menu> menus) {
        for (Menu menu : menus) {
            for (IngredienteMenu ingrediente : menu.getIngredientes()) {
                Optional<Stock> stockEncontrado = stockRepository.findStockByProductName(ingrediente.getIngrediente().getNombre());

                if (stockEncontrado.isPresent() && stockEncontrado.get().getCantidad() < ingrediente.getCantidad()) {
                    // Si es menor solo devuelve los menus que puede producir junto con un error
                    return new ResponseEntity<>("El stock no es suficiente", HttpStatus.BAD_REQUEST);
                }
            }
        }
        return new ResponseEntity<>("El stock es suficiente", HttpStatus.CREATED);
    }


    @Transactional
    @PostMapping("/stock/create")
    public ResponseEntity<String> crearStock(@RequestBody Stock stockDetail) {
        System.out.println(stockDetail);
        Optional<Stock> stockEncontrado = stockRepository.findStockByProductName(stockDetail.getIngrediente().getNombre());
        // Si no hay stock del producto cargado, entonces creamos uno nuevo. Caso contrario utilizamos y editamos el que ya está cargado en la base de datos
        if (stockEncontrado.isEmpty()) {
            // Si no existe stock de ese producto se crea un nuevo objeto
            Stock stock = new Stock();

            stock.setFechaIngreso(stockDetail.getFechaIngreso());
            stock.setCantidad(stockDetail.getCantidad());
            stock.setBorrado("NO");

            Ingrediente ingrediente = new Ingrediente();

            ingrediente.setNombre(stockDetail.getIngrediente().getNombre());

            ingrediente.setCosto(stockDetail.getIngrediente().getCosto());

            ingrediente.setMedida(stockDetail.getIngrediente().getMedida());

            // Asignamos el ingrediente a este nuevo stock
            stock.setIngrediente(ingrediente);
            // Guardamos nuevamente el ingredienteDB con los posibles datos nuevos
            ingredienteRepository.save(ingrediente);

            System.out.println(stockDetail.getFechaIngreso());
            // Finalmente se guarda y se devuelve un mensaje con el ok
            stockRepository.save(stock);

            return new ResponseEntity<>("El stock ha sido añadido correctamente", HttpStatus.CREATED);
        }

        return new ResponseEntity<>("El stock ya existe", HttpStatus.FOUND);
    }

    @PutMapping("/stock/update")
    public ResponseEntity<Stock> actualizarStock(@RequestBody Stock stock) {
        Optional<Stock> stockEncontrado = stockRepository.findStockByProductName(stock.getIngrediente().getNombre());
        if (stockEncontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Stock stockFinal = stockRepository.save(stockEncontrado.get());
        return ResponseEntity.ok(stockFinal);
    }

    @DeleteMapping("stock/delete")
    public ResponseEntity<?> borrarStock(@RequestBody Stock stock) {
        Optional<Stock> stockEncontrado = stockRepository.findStockByProductName(stock.getIngrediente().getNombre());
        if (stockEncontrado.isEmpty()) {
            return new ResponseEntity<>("El stock ya ha sido borrado previamente", HttpStatus.BAD_REQUEST);
        }

        stockEncontrado.get().setBorrado("SI");
        stockRepository.save(stockEncontrado.get());
        return new ResponseEntity<>("El stock ha sido borrado correctamente", HttpStatus.ACCEPTED);
    }
}
