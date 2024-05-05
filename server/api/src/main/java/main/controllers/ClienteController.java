package main.controllers;

import jakarta.transaction.Transactional;
import main.controllers.EncryptMD5.Encrypt;
import main.entities.Cliente.Cliente;
import main.entities.Cliente.ClienteDTO;
import main.entities.Domicilio.Domicilio;
import main.entities.Domicilio.DomicilioDTO;
import main.repositories.ClienteRepository;
import main.repositories.DomicilioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
public class ClienteController {
    private final ClienteRepository clienteRepository;
    private final DomicilioRepository domicilioRepository;

    public ClienteController(ClienteRepository clienteRepository, DomicilioRepository domicilioRepository) {
        this.clienteRepository = clienteRepository;
        this.domicilioRepository = domicilioRepository;
    }

    @Transactional
    @PostMapping("/cliente/create")
    public ClienteDTO crearCliente(@RequestBody Cliente clienteDetails) throws Exception {
        Optional<Cliente> cliente = clienteRepository.findByEmail(clienteDetails.getEmail());

        if (cliente.isEmpty()) {
            clienteDetails.setContraseña(Encrypt.cifrarPassword(clienteDetails.getContraseña()));
            for (Domicilio domicilio : clienteDetails.getDomicilios()) {
                domicilio.setCliente(clienteDetails);
            }

            clienteDetails = clienteRepository.save(clienteDetails);

            ClienteDTO clienteDTO = new ClienteDTO();

            clienteDTO.setId(clienteDetails.getId());
            clienteDTO.setNombre(clienteDetails.getNombre());
            clienteDTO.setTelefono(clienteDetails.getTelefono());
            clienteDTO.setEmail(clienteDetails.getEmail());

            return clienteDTO;
        } else {
            return null;
        }
    }

    @CrossOrigin
    @GetMapping("/cliente/login/{email}/{password}")
    public ClienteDTO loginUser(@PathVariable("email") String email, @PathVariable("password") String password) throws Exception {
        return clienteRepository.findByEmailAndPasswordDTO(email, Encrypt.cifrarPassword(password));
    }

    @CrossOrigin
    @GetMapping("/cliente/domicilio/{email}")
    public Set<DomicilioDTO> getDomicilio(@PathVariable("email") String email) throws Exception {
        Optional<Cliente> cliente = clienteRepository.findByEmail(email);

        if (cliente.isEmpty()) {
            return null;
        }

        List<DomicilioDTO> domicilios = domicilioRepository.findByIdClienteDTO(cliente.get().getId());

        for (DomicilioDTO domicilio : domicilios) {
            domicilio.setCalle(Encrypt.desencriptarString(domicilio.getCalle()));
        }

        return new HashSet<>(domicilios);
    }

    @PutMapping("/cliente/update")
    public String updateCliente(@RequestBody Cliente clienteDetails) throws Exception {

        Optional<Cliente> clienteOptional = clienteRepository.findById(clienteDetails.getId());

        if (clienteOptional.isEmpty()) {
            return "Cliente inexistente";
        }

        Cliente cliente = clienteOptional.get();

        for (Domicilio domicilio : clienteDetails.getDomicilios()) {
            if (cliente.getDomicilios().stream().anyMatch(d ->
            {
                try {
                    return Encrypt.encriptarString(d.getCalle()).equals(domicilio.getCalle());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })) {
                cliente.setDomicilios(clienteDetails.getDomicilios());
            }
        }


        if (cliente.getTelefono() != clienteDetails.getTelefono() && clienteDetails.getTelefono() > 120000) {
            cliente.setTelefono(clienteDetails.getTelefono());
        }

        if (cliente.getEmail() != clienteDetails.getEmail() && clienteDetails.getEmail() != null) {
            cliente.setEmail(clienteDetails.getEmail());
        }

        if (Encrypt.cifrarPassword(clienteDetails.getContraseña()).equals(cliente.getContraseña()) && clienteDetails.getContraseña() != null) {
            cliente.setContraseña(Encrypt.cifrarPassword(clienteDetails.getContraseña()));
        }

        clienteRepository.save(cliente);

        return "Cliente actualizado con éxito";
    }

    @DeleteMapping("/cliente/{id}/delete")
    public ResponseEntity<?> borrarCliente(@RequestBody Cliente user) {
        Optional<Cliente> cliente = clienteRepository.findById(user.getId());
        if (!cliente.isPresent()) {
            return new ResponseEntity<>("El usuario no existe o ya ha sido borrado", HttpStatus.BAD_REQUEST);
        }

        cliente.get().setBorrado("SI");

        clienteRepository.save(cliente.get());

        return new ResponseEntity<>("El usuario ha sido borrado correctamente", HttpStatus.ACCEPTED);
    }
}
