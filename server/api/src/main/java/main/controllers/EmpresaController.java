package main.controllers;

import jakarta.transaction.Transactional;
import main.EncryptMD5.Encrypt;
import main.entities.Productos.Imagenes;
import main.entities.Restaurante.Empresa;
import main.mapper.Restaurante.EmpresaDTO;
import main.repositories.EmpresaRepository;
import main.repositories.ImagenesRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.util.*;

@RestController
public class EmpresaController {
    private final EmpresaRepository empresaRepository;
    private final ImagenesRepository imagenesRepository;

    public EmpresaController(EmpresaRepository empresaRepository, ImagenesRepository imagenesRepository) {
        this.empresaRepository = empresaRepository;
        this.imagenesRepository = imagenesRepository;
    }


    @CrossOrigin
    @PostMapping("/empresa/login")
    public ResponseEntity<EmpresaDTO> loginEmpresa(@RequestBody Map<String, String> credentials) {
        String variable = credentials.get("cuit");
        if (variable == null || variable.isEmpty()) variable = credentials.get("email");
        String password = credentials.get("contraseña");

        Optional<Empresa> empresa = empresaRepository.findByCuitOrNombreAndPassword(variable, Encrypt.cifrarPassword(password));

        if (empresa.isPresent()) {
            return ResponseEntity.ok(EmpresaDTO.toDTO(empresa.get()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        }
    }

    @CrossOrigin
    @GetMapping("/empresas")
    public Set<Empresa> getEmpresas() throws Exception {
        List<Empresa> empresas = empresaRepository.findAllDTO();

        for (Empresa empresa : empresas) {
            empresa.setImagenes(new HashSet<>(imagenesRepository.findByIdEmpresa(empresa.getId())));
        }

        return new HashSet<>(empresas);
    }

    @PostMapping("/empresa/create")
    @CrossOrigin
    @Transactional
    public ResponseEntity<String> crearEmpresa(@RequestBody Empresa empresaDetails) throws Exception {
        Optional<Empresa> empresaDB = empresaRepository.findByCuit(empresaDetails.getCuit());

        if (empresaDB.isEmpty()) {

            empresaDetails.setContraseña(Encrypt.cifrarPassword(empresaDetails.getContraseña()));

            empresaDetails.setBorrado("NO");

            empresaRepository.save(empresaDetails);

            return ResponseEntity.ok("Empresa creada con éxito");
        } else {
            return ResponseEntity.badRequest().body("Hay una empresa existente con ese cuit");
        }
    }

    @CrossOrigin
    @Transactional
    @PutMapping("/empresa/imagen/{id}/delete")
    public ResponseEntity<String> eliminarImagenEmpresa(@PathVariable("id") Long id) {
        Optional<Imagenes> imagen = imagenesRepository.findById(id);

        if (imagen.isPresent()) {
            try {
                imagen.get().setBorrado("SI");
                imagenesRepository.save(imagen.get());
                return new ResponseEntity<>(HttpStatus.ACCEPTED);

            } catch (Exception e) {
                System.out.println("Error al crear la imagen: " + e);
            }
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @CrossOrigin
    @Transactional
    @PutMapping("/empresa/update")
    public ResponseEntity<String> updateEmpresa(@RequestBody Empresa empresaDetails) throws Exception {
        Optional<Empresa> empresaDB = empresaRepository.findById(empresaDetails.getId());

        if (empresaDB.isPresent()) {
            Optional<Empresa> empresaEncontrada = empresaRepository.findByName(empresaDetails.getNombre());

            if (empresaEncontrada.isPresent() && empresaDB.get().getId() != empresaEncontrada.get().getId()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Existe una cuenta registrada con ese email");
            }

            empresaEncontrada = empresaRepository.findByCuit(empresaDetails.getCuit());

            if (empresaEncontrada.isPresent() && empresaDB.get().getId() != empresaEncontrada.get().getId()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Existe una cuenta registrada con ese cuit");
            }

            Empresa empresa = empresaDB.get();

            if (empresa.getBorrado().equals(empresaDetails.getBorrado())) {
                if (empresaDetails.getContraseña().length() > 1) {
                    empresa.setContraseña(Encrypt.cifrarPassword(empresaDetails.getContraseña()));
                }

                empresa.setNombre(empresaDetails.getNombre());

                empresa.setRazonSocial(empresaDetails.getRazonSocial());

                empresaRepository.save(empresa);

                return ResponseEntity.ok("La empresa se actualizó correctamente");
            } else {
                empresa.setBorrado(empresaDetails.getBorrado());
                empresaRepository.save(empresa);
                return ResponseEntity.ok("La empresa se actualizó correctamente");
            }
        } else {
            return ResponseEntity.ok("La empresa no se encontró");
        }
    }

    @CrossOrigin
    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/empresa/imagenes")
    public ResponseEntity<String> crearImagen(@RequestParam("file") MultipartFile file, @RequestParam("cuit") String cuit) {
        HashSet<Imagenes> listaImagenes = new HashSet<>();
        // Buscamos el nombre de la foto
        String fileName = file.getOriginalFilename().replaceAll(" ", "");
        try {
            String basePath = "/app/imagesEmpresas";
            String rutaCarpeta = basePath + File.separator + cuit.replaceAll(" ", "") + File.separator;

            // Verificar si la carpeta existe, caso contrario, crearla
            File carpeta = new File(rutaCarpeta);
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            String rutaArchivo = rutaCarpeta + fileName;
            file.transferTo(new File(rutaArchivo));

            String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("imagesEmpresas/")
                    .path(cuit.replaceAll(" ", "").replaceAll("-", "") + "/")
                    .path(fileName.replaceAll(" ", ""))
                    .toUriString();

            Imagenes imagen = new Imagenes();
            imagen.setNombre(fileName.replaceAll(" ", ""));
            imagen.setRuta(downloadUrl);
            imagen.setFormato(file.getContentType());

            listaImagenes.add(imagen);

            try {
                for (Imagenes imagenProducto : listaImagenes) {
                    // Asignamos el menu a la imagen
                    Optional<Empresa> empresa = empresaRepository.findByCuit(cuit);
                    if (empresa.isEmpty()) {
                        return new ResponseEntity<>("Empresa no encontrada", HttpStatus.NOT_FOUND);
                    }
                    imagenProducto.getEmpresas().add(empresa.get());
                    imagenesRepository.save(imagen);
                }

            } catch (Exception e) {
                System.out.println("Error al insertar la ruta en la empresa: " + e);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>("Imagen creada correctamente", HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Error al crear la imagen: " + e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
