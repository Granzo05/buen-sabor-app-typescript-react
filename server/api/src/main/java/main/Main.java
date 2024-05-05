package main;

import main.controllers.EncryptMD5.Encrypt;
import main.entities.Domicilio.Departamento;
import main.entities.Domicilio.Localidad;
import main.entities.Domicilio.Pais;
import main.entities.Domicilio.Provincia;
import main.entities.Restaurante.Empresa;
import main.entities.Restaurante.Sucursal;
import main.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.mail.MessagingException;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@SpringBootApplication
@EntityScan("main.entities")
@ComponentScan(basePackages = {"main.controllers", "main.repositories", "main.*"})
public class Main {
    public static void main(String[] args) throws GeneralSecurityException, IOException, MessagingException {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:5173/")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("Origin", "Content-Type", "Accept", "Authorization")
                        .allowCredentials(true);

            }
        };
    }

    @Autowired
    private PaisRepository paisRepository;
    @Autowired
    private ProvinciaRepository provinciaRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    private final String RUTACSV = "D://Buen-sabor//buen-sabor-app-typescript-react//server//api//src//main//resources//localidades.csv";
    private final String SEPARACIONCSV = ";";

    @Bean
    CommandLineRunner init() {
        return args -> {

            Optional<Empresa> empresaOp = empresaRepository.findByCuit(201234566l);

            if (empresaOp.isEmpty()) {
                Empresa empresa = new Empresa();
                empresa.setCuit(201234566);
                empresa.setRazonSocial("El buen sabor");

                Sucursal sucursal = new Sucursal();
                sucursal.setEmpresa(empresa);
                sucursal.setHorarioApertura(LocalTime.of(18,0));
                sucursal.setHorarioCierre(LocalTime.of(23,0));
                sucursal.setEmail("a@gmail.com");
                sucursal.setPrivilegios("negocio");
                sucursal.setContraseña(Encrypt.cifrarPassword("123"));

                empresa.getSucursales().add(sucursal);

                empresaRepository.save(empresa);
            }

            int cantidadProvincias = provinciaRepository.getCantidadProvincias();
            System.out.println("Provincias listas para usar");

            if (cantidadProvincias < 24) {
                System.out.println("No se han encontrado provincias. Creandolas...");
                try (BufferedReader br = new BufferedReader(new FileReader(RUTACSV))) {
                    Pais pais = crearPais("Argentina");
                    String line;

                    while ((line = br.readLine()) != null) {
                        String[] data = line.split(SEPARACIONCSV);
                        String localidadNombre = data[0];
                        String departamentoNombre = data[1];
                        String provinciaNombre = data[2];

                        cargarDatos(localidadNombre, departamentoNombre, provinciaNombre, pais);
                    }

                    paisRepository.save(pais);

                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        };
    }

    private Pais crearPais(String nombre) {
        Optional<Pais> paisDb = paisRepository.findByNombre(nombre);

        if (paisDb.isEmpty()) {
            Pais pais = new Pais();
            pais.setNombre(nombre);
            return pais;
        }

        return paisDb.get();
    }

    private void cargarDatos(String nombreLocalidad, String nombreDepartamento, String nombreProvincia, Pais pais) {
        crearProvincia(nombreProvincia, pais);
        Provincia provincia = pais.getProvincias().stream().filter(p -> p.getNombre().equals(nombreProvincia)).findFirst().orElse(null);
        // Una vez que la provincia se encuentra se crea el departamento asignado a esta provincia
        if (provincia != null) {
            crearDepartamento(nombreDepartamento, provincia);
            Departamento departamento = provincia.getDepartamentos().stream().filter(d -> d.getNombre().equals(nombreDepartamento)).findFirst().orElse(null);
            // Una vez que el departamento se encuentra se crea la localidad asignada a esta provincia
            if (departamento != null) {
                // Todos los valores se almacenan en Pais y sus hijos
                crearLocalidad(nombreLocalidad, departamento);
            }
        }
    }

    private void crearProvincia(String nombre, Pais pais) {
        // Buscamos si la provincia existe
        boolean provinciaExistente = pais.getProvincias().stream().anyMatch(provincia -> provincia.getNombre().equals(nombre));
        // Sino la creamos
        if (!provinciaExistente) {
            Provincia provinciaNueva = new Provincia();
            provinciaNueva.setNombre(nombre);
            provinciaNueva.setPais(pais);
            pais.getProvincias().add(provinciaNueva);
        }
    }

    private void crearDepartamento(String nombre, Provincia provincia) {
        boolean departamentoExistente = provincia.getDepartamentos().stream().anyMatch(departamento -> departamento.getNombre().equals(nombre));
        if (!departamentoExistente) {
            Departamento departamentoNuevo = new Departamento();
            departamentoNuevo.setNombre(nombre);
            departamentoNuevo.setProvincia(provincia);
            provincia.getDepartamentos().add(departamentoNuevo);
        }
    }

    private void crearLocalidad(String nombre, Departamento departamento) {
        boolean localidadExistente = departamento.getLocalidades().stream().anyMatch(localidad -> localidad.getNombre().equals(nombre));
        if (!localidadExistente) {
            Localidad localidadNueva = new Localidad();
            localidadNueva.setNombre(nombre);
            localidadNueva.setDepartamento(departamento);
            departamento.getLocalidades().add(localidadNueva);
        }
    }
}
