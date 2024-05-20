package main.controllers;

import main.entities.Productos.*;
import main.entities.Restaurante.Sucursal;
import main.entities.Stock.StockArticuloVenta;
import main.repositories.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
public class ArticuloVentaController {
    private final StockArticuloVentaRepository stockArticuloVentaRepository;
    private final ImagenesRepository imagenesRepository;
    private final ArticuloVentaRepository articuloVentaRepository;
    private final SucursalRepository sucursalRepository;

    public ArticuloVentaController(StockArticuloVentaRepository stockArticuloVentaRepository, ImagenesRepository imagenesRepository, ArticuloVentaRepository articuloVentaRepository, SucursalRepository sucursalRepository) {
        this.stockArticuloVentaRepository = stockArticuloVentaRepository;
        this.imagenesRepository = imagenesRepository;
        this.articuloVentaRepository = articuloVentaRepository;
        this.sucursalRepository = sucursalRepository;
    }

    // Busca por id de articulo
    @GetMapping("/articulos/{idSucursal}")
    public Set<ArticuloVentaDTO> getArticulosDisponibles(@PathVariable("idSucursal") Long idSucursal) {
        List<ArticuloVentaDTO> articulos = articuloVentaRepository.findAllBySucursal(idSucursal);

        for (ArticuloVentaDTO articulo : articulos) {
            articulo.setImagenesDTO(new HashSet<>(imagenesRepository.findByIdArticuloDTO(articulo.getId())));
        }

        return new HashSet<>(articulos);
    }

    @Transactional
    @PostMapping("/articulo/create/{idSucursal}")
    public ResponseEntity<String> crearArticulo(@RequestBody ArticuloVenta articuloVenta, @PathVariable("idSucursal") Long idSucursal) {
        Optional<ArticuloVenta> articuloDB = articuloVentaRepository.findByName(articuloVenta.getNombre());
        if (articuloDB.isEmpty()) {
            // Si la sucursal coincide con los privilegios del admin o de la empresa que agregue todas las sucursales al menu
            if (idSucursal == 0) {
                List<Sucursal> sucursales = sucursalRepository.findAll();
                for (Sucursal sucursal : sucursales) {
                    sucursal.getArticulosVenta().add(articuloVenta);
                    articuloVenta.getSucursales().add(sucursal);
                }
            } else {
                Optional<Sucursal> sucursalOpt = sucursalRepository.findById(idSucursal);
                if (sucursalOpt.isPresent()) {
                    Sucursal sucursal = sucursalOpt.get();
                    sucursal.getArticulosVenta().add(articuloVenta);
                    articuloVenta.getSucursales().add(sucursal);
                } else {
                    return new ResponseEntity<>("Sucursal no encontrada con id: " + idSucursal, HttpStatus.NOT_FOUND);
                }
            }
            articuloVentaRepository.save(articuloVenta);

            return new ResponseEntity<>("El articulo ha sido añadido correctamente", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Hay un articulo creado con ese nombre", HttpStatus.FOUND);
        }
    }

    @PostMapping("/articulo/imagenes")
    public ResponseEntity<String> crearImagen(@RequestParam("file") MultipartFile file, @RequestParam("nombreArticulo") String nombreArticulo) {
        HashSet<Imagenes> listaImagenes = new HashSet<>();
        // Buscamos el nombre de la foto
        String fileName = file.getOriginalFilename().replaceAll(" ", "");
        try {
            String basePath = new File("").getAbsolutePath();
            String rutaCarpeta = basePath + File.separator + "src" + File.separator + "main" + File.separator + "webapp" + File.separator + "WEB-INF" + File.separator + "images" + File.separator + nombreArticulo.replaceAll(" ", "") + File.separator;

            // Verificar si la carpeta existe, caso contrario, crearla
            File carpeta = new File(rutaCarpeta);
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            String rutaArchivo = rutaCarpeta + fileName;
            file.transferTo(new File(rutaArchivo));

            String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path(nombreArticulo.replaceAll(" ", "") + "/")
                    .path(fileName.replaceAll(" ", ""))
                    .toUriString();

            Imagenes imagen = new Imagenes();
            imagen.setNombre(fileName.replaceAll(" ", ""));
            imagen.setRuta(downloadUrl);
            imagen.setFormato(file.getContentType());

            listaImagenes.add(imagen);

            try {
                for (Imagenes imagenProducto : listaImagenes) {
                    // Asignamos el articulo a la imagen
                    Optional<ArticuloVenta> articulo = articuloVentaRepository.findByName(nombreArticulo);
                    if (articulo.isEmpty()) {
                        return new ResponseEntity<>("Articulo vacio", HttpStatus.NOT_FOUND);
                    }
                    imagenProducto.setArticuloVenta(articulo.get());

                    imagenesRepository.save(imagen);
                }

            } catch (Exception e) {
                System.out.println("Error al insertar la ruta en el articulo: " + e);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>("Imagen creada correctamente", HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Error al crear la imagen: " + e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/articulo/imagen/{id}/delete")
    public ResponseEntity<String> eliminarImagen(@PathVariable("id") Long id) {
        List<Imagenes> imagenes = imagenesRepository.findByIdArticulo(id);

        for (Imagenes imagen: imagenes) {
            try {
                imagen.setBorrado("SI");
                imagenesRepository.save(imagen);
                return new ResponseEntity<>("Imagen creada correctamente", HttpStatus.OK);
            } catch (Exception e) {
                System.out.println("Error al crear la imagen: " + e);
            }
        }

        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/articulo/tipo/{tipoArticulo}/{idSucursal}")
    public Set<ArticuloVentaDTO> getArticulosPorTipo(@PathVariable("tipoArticulo") String tipo, @PathVariable("idSucursal") Long id) {
        String tipoArticulo = tipo.toUpperCase().replace(" ", "_");
        Set<ArticuloVentaDTO> articuloVentas = (new HashSet<>(articuloVentaRepository.findByTipoAndIdSucursal(EnumTipoArticuloVenta.valueOf(tipoArticulo), id)));

        for (ArticuloVentaDTO articuloVenta : articuloVentas) {
            articuloVenta.setImagenesDTO(new HashSet<>(imagenesRepository.findByIdArticuloDTO(articuloVenta.getId())));
        }

        return articuloVentas;
    }

    @PutMapping("/articulo/update/{idSucursal}")
    public ResponseEntity<String> actualizarArticulo(@RequestBody ArticuloVenta articuloVentaDetail, @PathVariable("idSucursal") Long id) {
        Optional<ArticuloVenta> articuloEncontrado = articuloVentaRepository.findByIdArticuloAndIdSucursal(articuloVentaDetail.getId(), id);

        if (articuloEncontrado.isPresent() && articuloEncontrado.get().getBorrado().equals(articuloVentaDetail.getBorrado())) {
            ArticuloVenta articuloVenta = articuloEncontrado.get();
            articuloVenta.setPrecioVenta(articuloVentaDetail.getPrecioVenta());
            articuloVenta.setNombre(articuloVentaDetail.getNombre());
            articuloVenta.setTipo(articuloVentaDetail.getTipo());
            articuloVenta.setMedida(articuloVentaDetail.getMedida());
            articuloVenta.setCantidadMedida(articuloVentaDetail.getCantidadMedida());

            articuloVentaRepository.save(articuloVenta);

            return ResponseEntity.ok("El articulo ha sido actualizado correctamente");

        } else if (articuloEncontrado.isPresent() && !articuloEncontrado.get().getBorrado().equals(articuloVentaDetail.getBorrado())) {
            ArticuloVenta articuloVenta = articuloEncontrado.get();

            articuloVenta.setBorrado(articuloVentaDetail.getBorrado());

            articuloVentaRepository.save(articuloVenta);

            Optional<StockArticuloVenta> stock = stockArticuloVentaRepository.findByIdArticuloAndIdSucursal(articuloVenta.getId(), id);

            if (stock.isPresent()) {
                stock.get().setBorrado("SI");
            }

            return ResponseEntity.ok("El articulo ha sido actualizado correctamente");
        }

        return ResponseEntity.ofNullable("El articulo no se ha encontrado");
    }

}
