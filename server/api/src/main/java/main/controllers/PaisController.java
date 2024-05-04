package main.controllers;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import main.entities.Domicilio.Departamento;
import main.entities.Domicilio.Localidad;
import main.entities.Domicilio.Pais;
import main.entities.Domicilio.Provincia;
import main.repositories.DepartamentoRepository;
import main.repositories.LocalidadRepository;
import main.repositories.PaisRepository;
import main.repositories.ProvinciaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
public class PaisController {
    private final LocalidadRepository localidadRepository;
    private final DepartamentoRepository departamentoRepository;
    private final ProvinciaRepository provinciaRepository;
    private final PaisRepository paisRepository;

    private final String RUTACSV = "D://Buen-sabor//buen-sabor-app-typescript-react//server//api//src//main//resources//localidades.csv";
    private final String SEPARACIONCSV = ";";

    public PaisController(LocalidadRepository localidadRepository, DepartamentoRepository departamentoRepository, ProvinciaRepository provinciaRepository, PaisRepository paisRepository) {
        this.localidadRepository = localidadRepository;
        this.departamentoRepository = departamentoRepository;
        this.provinciaRepository = provinciaRepository;
        this.paisRepository = paisRepository;
    }

    @PostMapping("/provincias/create")
    public ResponseEntity<String> cargarProvincias() {
        int provincias = provinciaRepository.getCantidadProvincias();

        if (provincias < 24) {
            try (BufferedReader br = new BufferedReader(new FileReader(RUTACSV))) {
                Pais pais = crearPais("Argentina");
                String line;
                while ((line = br.readLine()) != null) {
                    String[] data = line.split(SEPARACIONCSV);
                    String provinciaNombre = data[2];

                    crearProvincia(provinciaNombre, pais);
                }

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return ResponseEntity.ok("Provincias cargadas");
    }

    @PostMapping("/departamentos/create/{idProvincia}")
    public Set<Departamento> cargarDepartamentos(@PathVariable("idProvincia") Long id) {
        try (BufferedReader br = new BufferedReader(new FileReader(RUTACSV))) {
            String line;

            Optional<Provincia> provincia = provinciaRepository.findById(id);

            Set<Departamento> departamentos = new HashSet<>();

            if(!provincia.isEmpty()) {
                List<Departamento> departamentosDb = departamentoRepository.findByProvinciaId(provincia.get().getId());

                if(departamentosDb.isEmpty()) {
                    while ((line = br.readLine()) != null) {
                        String[] data = line.split(SEPARACIONCSV);

                        // Verificar si la línea tiene al menos tres elementos y si el tercer elemento coincide con el nombre de la provincia
                        if (data.length > 2 && data[2].equals(provincia.get().getNombre())) {
                            Departamento departamento = crearDepartamento(data[1], provincia.get());
                            departamentos.add(departamento);
                            crearLocalidad(data[0], departamento);
                        }
                    }
                }
            }


            return departamentos;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Pais crearPais(String nombre) {
        Optional<Pais> paisDb = paisRepository.findByNombre(nombre);

        if (paisDb.isEmpty()) {
            Pais pais = new Pais();
            pais.setNombre("Argentina");
            return paisRepository.save(pais);
        }

        return paisDb.get();
    }

    private void crearProvincia(String nombre, Pais pais) {
        Optional<Provincia> provinciaDb = provinciaRepository.findByNombre(nombre);

        if (provinciaDb.isEmpty()) {
            Provincia provincia = new Provincia();
            provincia.setNombre(nombre);
            provincia.setPais(pais);
            provinciaRepository.save(provincia);
        }
    }

    private Departamento crearDepartamento(String nombre, Provincia provincia) {
        Optional<Departamento> departamentoDb = departamentoRepository.findByNombre(nombre);

        if (departamentoDb.isEmpty()) {
            Departamento departamento = new Departamento();
            departamento.setNombre(nombre);
            departamento.setProvincia(provincia);
            return departamentoRepository.save(departamento);
        }

        return departamentoDb.get();
    }

    private void crearLocalidad(String nombre, Departamento departamento) {
        Optional<Localidad> localidadDb = localidadRepository.findByNombre(nombre);

        if (localidadDb.isEmpty()) {
            Localidad localidad = new Localidad();
            localidad.setNombre(nombre);
            localidad.setDepartamento(departamento);

            localidadRepository.save(localidad);
        }
    }

    @CrossOrigin
    @GetMapping("/provincias")
    public Set<Provincia> getProvincias() {
        Set provincias = new HashSet<>(provinciaRepository.findAll());

        return provincias;
    }

    @CrossOrigin
    @GetMapping("/localidades")
    public Set<Localidad> getLocalidades() {
        Set localidades = new HashSet<>(localidadRepository.findAll());

        return localidades;
    }

    @CrossOrigin
    @GetMapping("/localidades/{departamentoId}")
    public Set<Localidad> getLocalidadesByDepartamentoId(@PathVariable("departamentoId") Long id) {
        Set localidades = new HashSet<>(localidadRepository.findByIdDepartamento(id));

        return localidades;
    }

    @CrossOrigin
    @GetMapping("/departamentos/{provinciaId}")
    public Set<Departamento> getDepartamentosByDepartamentoId(@PathVariable("provinciaId") Long id) {
        Set departamentos = new HashSet<>(departamentoRepository.findByProvinciaId(id));

        return departamentos;
    }

}
