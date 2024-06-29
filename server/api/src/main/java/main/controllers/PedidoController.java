package main.controllers;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import jakarta.transaction.Transactional;
import main.EncryptMD5.Encrypt;
import main.entities.Cliente.Cliente;
import main.entities.Domicilio.Domicilio;
import main.entities.Factura.Factura;
import main.entities.Ingredientes.IngredienteMenu;
import main.entities.Pedidos.DetallesPedido;
import main.entities.Pedidos.EnumEstadoPedido;
import main.entities.Pedidos.EnumTipoEnvio;
import main.entities.Pedidos.Pedido;
import main.entities.Productos.DetallePromocion;
import main.entities.Restaurante.Sucursal;
import main.entities.Stock.StockArticuloVenta;
import main.entities.Stock.StockIngredientes;
import main.repositories.*;
import main.utility.Gmail;
import main.utility.PreferenceMP;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.*;

@RestController
public class PedidoController {
    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final SucursalRepository sucursalRepository;
    private final FacturaRepository facturaRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final StockArticuloVentaRepository stockArticuloVentaRepository;
    private final StockIngredientesRepository stockIngredientesRepository;
    private final DomicilioRepository domicilioRepository;

    public PedidoController(PedidoRepository pedidoRepository,
                            ClienteRepository clienteRepository,
                            SucursalRepository sucursalRepository, FacturaRepository facturaRepository, DetallePedidoRepository detallePedidoRepository, StockArticuloVentaRepository stockArticuloVentaRepository, StockIngredientesRepository stockIngredientesRepository, DomicilioRepository domicilioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.sucursalRepository = sucursalRepository;
        this.facturaRepository = facturaRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.stockArticuloVentaRepository = stockArticuloVentaRepository;
        this.stockIngredientesRepository = stockIngredientesRepository;
        this.domicilioRepository = domicilioRepository;
    }

    @CrossOrigin
    @GetMapping("/api/top-comidas/{fechaInicio}/{fechaFin}")
    public ResponseEntity<List<List<Object>>> getTopComidas(
            @PathVariable("fechaInicio") LocalDate fechaInicio,
            @PathVariable("fechaFin") LocalDate fechaFin) {

        try {
            LocalDateTime fechaInicioDateTime = fechaInicio.atStartOfDay();
            LocalDateTime fechaFinDateTime = fechaFin.atStartOfDay().plusDays(1).minusSeconds(1);

            List<Object[]> resultados = pedidoRepository.findTopComidasByFecha(fechaInicioDateTime, fechaFinDateTime);

            List<List<Object>> data = new ArrayList<>();
            data.add(List.of("Nombre Comida", "Cantidad Total"));

            for (Object[] resultado : resultados) {
                String nombreComida = (String) resultado[0];
                Long cantidadTotal = (Long) resultado[1];
                data.add(List.of(nombreComida, cantidadTotal));
            }

            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @CrossOrigin
    @GetMapping("/cliente/{id}/pedidos/{estado}")
    public Set<Pedido> getPedidosPorClienteYEstado(@PathVariable("id") Long idCliente, @PathVariable("estado") int estadoValue) throws Exception {
        EnumEstadoPedido estado = EnumEstadoPedido.fromValue(estadoValue);
        List<Pedido> pedidos = pedidoRepository.findPedidosByEstadoAndIdCliente(estado, idCliente);

        for (Pedido pedido : pedidos) {
            try {
                pedido.getDomicilioEntrega().setCalle(Encrypt.desencriptarString(pedido.getDomicilioEntrega().getCalle()));
            } catch (Exception ignored) {
            }
        }

        return new HashSet<>(pedidos);
    }

    @CrossOrigin
    @GetMapping("/cliente/{id}/pedidos/distintos/{estado}")
    public Set<Pedido> getPedidosPorClienteDistintosAlEstado(@PathVariable("id") Long idCliente, @PathVariable("estado") int estadoValue) {
        EnumEstadoPedido estado = EnumEstadoPedido.fromValue(estadoValue);
        List<Pedido> pedidos = pedidoRepository.findPedidosByEstadosDistntosAndIdCliente(estado, idCliente);

        for (Pedido pedido : pedidos) {
            try {
                pedido.getDomicilioEntrega().setCalle(Encrypt.desencriptarString(pedido.getDomicilioEntrega().getCalle()));
            } catch (Exception ignored) {
            }
        }

        return new HashSet<>(pedidos);
    }

    @CrossOrigin
    @GetMapping("/pedidos/{idSucursal}")
    public Set<Pedido> getPedidosPorNegocio(@PathVariable("idSucursal") Long idSucursal) {
        List<Pedido> pedidos = pedidoRepository.findAllByIdSucursal(idSucursal);

        return new HashSet<>(pedidos);
    }

    @CrossOrigin
    @GetMapping("/pedidos/{estado}/{idSucursal}")
    public Set<Pedido> getPedidosPorEstado(@PathVariable("estado") int estadoValue, @PathVariable("idSucursal") Long idSucursal) throws Exception {
        EnumEstadoPedido estado = EnumEstadoPedido.fromValue(estadoValue);
        List<Pedido> pedidos = pedidoRepository.findPedidosByEstadoAndIdSucursal(estado, idSucursal);

        for (Pedido pedido : pedidos) {
            try {
                pedido.getDomicilioEntrega().setCalle(Encrypt.desencriptarString(pedido.getDomicilioEntrega().getCalle()));
            } catch (IllegalArgumentException ignored) {
            }
        }

        return new HashSet<>(pedidos);
    }

    @CrossOrigin
    @Transactional
    @PostMapping("/pedido/create/{idSucursal}")
    public ResponseEntity<String> crearPedido(@RequestBody Pedido pedido, @PathVariable("idSucursal") Long idSucursal) {
        Optional<Pedido> pedidoDB = pedidoRepository.findByIdAndIdSucursal(pedido.getId(), idSucursal);

        Cliente cliente = clienteRepository.findById(pedido.getCliente().getId()).get();

        // Revisamos que el pedido exista y que el cliente no tenga la cuenta bloqueada
        if (pedidoDB.isEmpty() && cliente.getBorrado().equals("NO")) {
            for (DetallesPedido detallesPedido : pedido.getDetallesPedido()) {
                detallesPedido.setPedido(pedido);
                descontarStock(detallesPedido, idSucursal);
            }

            pedido.setCliente(cliente);

            Sucursal sucursal = sucursalRepository.findById(idSucursal).get();
            pedido.getSucursales().add(sucursal);

            // Si el domicilio el null es porque es un retiro en tienda, por lo tanto almacenamos la tienda de donde se retira
            if (pedido.getDomicilioEntrega() == null) {
                // Que se no borrado quiere decir que es el domicilio actual de la sucursal
                pedido.setDomicilioEntrega(domicilioRepository.findByIdSucursalNotBorrado(sucursal.getId()));
            }

            pedidoRepository.save(pedido);

            return ResponseEntity.ok("Pedido creado con éxito");
        } else if (cliente.getBorrado().equals("SI")) {
            return ResponseEntity.badRequest().body("Tu cuenta ha sido bloqueada por el restaurante");
        }

        return ResponseEntity.badRequest().body("Ocurrió un error al generar el pedido");
    }

    @Transactional
    @CrossOrigin
    @PostMapping("/pedido/create/mercadopago/{idSucursal}")
    public PreferenceMP crearPedidoMercadopago(@RequestBody Pedido pedido, @PathVariable("idSucursal") Long idSucursal) {

        Optional<Pedido> pedidoDB = pedidoRepository.findByIdAndIdSucursal(pedido.getId(), idSucursal);

        Cliente cliente = clienteRepository.findById(pedido.getCliente().getId()).get();

        if (pedidoDB.isEmpty() && pedido.getPreferencia() == null && cliente.getBorrado().equals("NO")) {
            try {

                for (DetallesPedido detallesPedido : pedido.getDetallesPedido()) {
                    detallesPedido.setPedido(pedido);
                    descontarStock(detallesPedido, idSucursal);
                }

                pedido.setEstado(EnumEstadoPedido.PROCESO_DE_PAGO);

                pedido.setCliente(cliente);

                Sucursal sucursal = sucursalRepository.findById(idSucursal).get();
                pedido.getSucursales().add(sucursal);

                // Si el domicilio el null es porque es un retiro en tienda, por lo tanto almacenamos la tienda de donde se retira
                if (pedido.getDomicilioEntrega() == null) {
                    pedido.setDomicilioEntrega(domicilioRepository.findByIdSucursalNotBorrado(sucursal.getId()));
                } else {
                    Domicilio domicilio = domicilioRepository.findById(pedido.getDomicilioEntrega().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Domicilio no encontrado"));
                    pedido.setDomicilioEntrega(domicilio);
                }

                pedidoRepository.save(pedido);


                MercadoPagoConfig.setAccessToken("TEST-4348060094658217-052007-d8458fa36a2d40dd8023bfcb9f27fd4e-1819307913");

                List<PreferenceItemRequest> items = new ArrayList<>();

                for (DetallesPedido detallesPedido : pedido.getDetallesPedido()) {

                    if (detallesPedido.getArticuloMenu() != null) {
                        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                                .id(String.valueOf(detallesPedido.getArticuloMenu().getId()))
                                .title(detallesPedido.getArticuloMenu().getNombre())
                                .categoryId(String.valueOf(detallesPedido.getArticuloMenu().getCategoria().getId()))
                                .quantity(detallesPedido.getCantidad())
                                .currencyId("ARS")
                                .unitPrice(new BigDecimal(detallesPedido.getArticuloMenu().getPrecioVenta()))
                                .build();
                        items.add(itemRequest);
                    } else if (detallesPedido.getArticuloVenta() != null) {
                        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                                .id(String.valueOf(detallesPedido.getArticuloVenta().getId()))
                                .title(detallesPedido.getArticuloVenta().getNombre())
                                .categoryId(String.valueOf(detallesPedido.getArticuloVenta().getCategoria().getId()))
                                .quantity(detallesPedido.getCantidad())
                                .currencyId("ARS")
                                .unitPrice(new BigDecimal(detallesPedido.getArticuloVenta().getPrecioVenta()))
                                .build();
                        items.add(itemRequest);
                    } else if (detallesPedido.getPromocion() != null) {
                        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                                .id(String.valueOf(detallesPedido.getPromocion().getId()))
                                .title(detallesPedido.getPromocion().getNombre())
                                .quantity(detallesPedido.getCantidad())
                                .currencyId("ARS")
                                .unitPrice(new BigDecimal(detallesPedido.getPromocion().getPrecio()))
                                .build();
                        items.add(itemRequest);
                    }
                }

                PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                        .success("http://localhost:5173/cliente/opciones/1")
                        .failure("http://localhost:5173/pago")
                        .build();

                PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                        .autoReturn("approved")
                        .externalReference(String.valueOf(pedido.getId()))
                        .items(items)
                        .backUrls(backUrls)
                        .build();
                PreferenceClient client = new PreferenceClient();

                MPRequestOptions options = MPRequestOptions.builder()
                        .connectionTimeout(120000)
                        .build();

                Preference preference = client.create(preferenceRequest, options);

                PreferenceMP mpPreference = new PreferenceMP();
                mpPreference.setStatusCode(preference.getResponse().getStatusCode());
                mpPreference.setId(preference.getId());

                pedido.setPreferencia(mpPreference.getId());

                pedidoRepository.save(pedido);

                return mpPreference;

            } catch (MPException | MPApiException e) {
                throw new RuntimeException(e);
            }
        } else if (cliente.getBorrado().equals("SI")) {
            PreferenceMP preferencia = new PreferenceMP();
            preferencia.setId("0");
            return preferencia;
        } else {
            PreferenceMP mpPreference = new PreferenceMP();
            mpPreference.setStatusCode(200);
            mpPreference.setId(pedido.getPreferencia());

            return mpPreference;
        }
    }

    private void descontarStock(DetallesPedido detallesPedido, Long idSucursal) {
        if (detallesPedido.getArticuloVenta() != null) {
            Optional<StockArticuloVenta> stockArticuloVenta = stockArticuloVentaRepository.findByIdArticuloAndIdSucursal(detallesPedido.getArticuloVenta().getId(), idSucursal);

            if (stockArticuloVenta.isPresent()) {
                stockArticuloVenta.get().setCantidadActual(stockArticuloVenta.get().getCantidadActual() - detallesPedido.getCantidad());
                stockArticuloVentaRepository.save(stockArticuloVenta.get());
            }
        }

        if (detallesPedido.getArticuloMenu() != null) {
            for (IngredienteMenu ingrediente : detallesPedido.getArticuloMenu().getIngredientesMenu()) {
                Optional<StockIngredientes> stockIngrediente = stockIngredientesRepository.findByNameIngredienteAndIdSucursal(ingrediente.getIngrediente().getNombre(), idSucursal);

                // Si la cantidad del ingrediente es superior a la maxima almacenada quiere decir que probablemente se trate de una diferencia de medidas
                if (stockIngrediente.get().getCantidadMaxima() < ingrediente.getCantidad()) {
                    stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() - (ingrediente.getCantidad() / 1000 * detallesPedido.getCantidad()));
                } else {
                    stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() - (ingrediente.getCantidad() * detallesPedido.getCantidad()));
                }

                stockIngredientesRepository.save(stockIngrediente.get());
            }
        }

        if (detallesPedido.getPromocion() != null) {
            for (DetallePromocion detalle : detallesPedido.getPromocion().getDetallesPromocion()) {
                if (detalle.getArticuloMenu() != null) {
                    for (IngredienteMenu ingrediente : detalle.getArticuloMenu().getIngredientesMenu()) {
                        Optional<StockIngredientes> stockIngrediente = stockIngredientesRepository.findByNameIngredienteAndIdSucursal(ingrediente.getIngrediente().getNombre(), idSucursal);

                        // Si la cantidad del ingrediente es superior a la maxima almacenada quiere decir que probablemente se trate de una diferencia de medidas
                        if (stockIngrediente.get().getCantidadMaxima() < ingrediente.getCantidad()) {
                            stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() - (ingrediente.getCantidad() / 1000) * detalle.getCantidad());
                        } else {
                            stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() - (ingrediente.getCantidad() * detalle.getCantidad()));
                        }

                        stockIngredientesRepository.save(stockIngrediente.get());
                    }
                }
                if (detalle.getArticuloVenta() != null) {
                    Optional<StockArticuloVenta> stockArticuloVenta = stockArticuloVentaRepository.findByIdArticuloAndIdSucursal(detalle.getArticuloVenta().getId(), idSucursal);

                    if (stockArticuloVenta.isPresent()) {
                        stockArticuloVenta.get().setCantidadActual(stockArticuloVenta.get().getCantidadActual() - detalle.getCantidad());
                        stockArticuloVentaRepository.save(stockArticuloVenta.get());
                    }
                }
            }
        }
    }

    private void reponerStock(DetallesPedido detallesPedido, Long idSucursal) {
        if (detallesPedido.getArticuloVenta() != null) {
            Optional<StockArticuloVenta> stockArticuloVenta = stockArticuloVentaRepository.findByIdArticuloAndIdSucursal(detallesPedido.getArticuloVenta().getId(), idSucursal);

            if (stockArticuloVenta.isPresent()) {
                stockArticuloVenta.get().setCantidadActual(stockArticuloVenta.get().getCantidadActual() + detallesPedido.getCantidad());
                stockArticuloVentaRepository.save(stockArticuloVenta.get());
            }
        }

        if (detallesPedido.getArticuloMenu() != null) {
            for (IngredienteMenu ingrediente : detallesPedido.getArticuloMenu().getIngredientesMenu()) {
                Optional<StockIngredientes> stockIngrediente = stockIngredientesRepository.findByIdIngredienteAndIdSucursal(ingrediente.getIngrediente().getId(), idSucursal);

                if (stockIngrediente.isPresent()) {
                    stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() + detallesPedido.getCantidad());

                    if (stockIngrediente.get().getCantidadMaxima() > ingrediente.getCantidad()) {
                        stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() + detallesPedido.getCantidad() / 1000);
                    } else {
                        stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() + detallesPedido.getCantidad());
                    }

                    stockIngredientesRepository.save(stockIngrediente.get());
                }
            }
        }

        if (detallesPedido.getPromocion() != null) {
            for (DetallePromocion detalle : detallesPedido.getPromocion().getDetallesPromocion()) {
                if (detalle.getArticuloMenu() != null) {
                    for (IngredienteMenu ingrediente : detalle.getArticuloMenu().getIngredientesMenu()) {
                        Optional<StockIngredientes> stockIngrediente = stockIngredientesRepository.findByNameIngredienteAndIdSucursal(ingrediente.getIngrediente().getNombre(), idSucursal);

                        // Si la cantidad del ingrediente es superior a la maxima almacenada quiere decir que probablemente se trate de una diferencia de medidas
                        if (stockIngrediente.get().getCantidadMaxima() < ingrediente.getCantidad()) {
                            stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() + (ingrediente.getCantidad() / 1000) * detalle.getCantidad());
                        } else {
                            stockIngrediente.get().setCantidadActual(stockIngrediente.get().getCantidadActual() + (ingrediente.getCantidad() * detalle.getCantidad()));
                        }

                        stockIngredientesRepository.save(stockIngrediente.get());
                    }
                }
                if (detalle.getArticuloVenta() != null) {
                    Optional<StockArticuloVenta> stockArticuloVenta = stockArticuloVentaRepository.findByIdArticuloAndIdSucursal(detalle.getArticuloVenta().getId(), idSucursal);

                    if (stockArticuloVenta.isPresent()) {
                        stockArticuloVenta.get().setCantidadActual(stockArticuloVenta.get().getCantidadActual() + detalle.getCantidad());
                        stockArticuloVentaRepository.save(stockArticuloVenta.get());
                    }
                }
            }
        }
    }

    @Transactional
    @CrossOrigin
    @PutMapping("/pedido/update/{idSucursal}")
    public ResponseEntity<?> updatePedido(@RequestBody Pedido pedido, @PathVariable("idSucursal") Long idSucursal) {
        pedidoRepository.save(pedido);
        return new ResponseEntity<>("El pedido ha sido actualizado correctamente", HttpStatus.ACCEPTED);
    }

    @PutMapping("/pedido/update/estado/{idSucursal}")
    @CrossOrigin
    @Transactional
    public ResponseEntity<String> updateEstadoPedido(@RequestBody Pedido pedido, @PathVariable("idSucursal") Long
            idSucursal) throws GeneralSecurityException, IOException, MessagingException {
        Optional<Pedido> pedidoDb = pedidoRepository.findByIdAndIdSucursal(pedido.getId(), idSucursal);

        if (pedidoDb.isEmpty()) {
            return new ResponseEntity<>("La pedido ya ha sido borrada previamente", HttpStatus.BAD_REQUEST);
        }

        pedidoDb.get().setEstado(pedido.getEstado());

        if (pedido.getEstado().equals(EnumEstadoPedido.ENTREGADOS)) {
            pedidoDb.get().setFactura(pedido.getFactura());

            ResponseEntity<byte[]> archivo = generarFacturaPDF(pedidoDb.get().getId());
            Gmail gmail = new Gmail();

            if (pedido.getTipoEnvio().equals(EnumTipoEnvio.DELIVERY)) {
                Optional<Sucursal> sucursal = sucursalRepository.findById(idSucursal);

                if (sucursal.isPresent()) {
                    gmail.enviarCorreoConArchivo("Su pedido está en camino", "Gracias por su compra", pedido.getCliente().getEmail(), sucursal.get().getEmail(), archivo.getBody());
                }
            } else {
                Optional<Sucursal> sucursal = sucursalRepository.findById(idSucursal);

                if (sucursal.isPresent()) {
                    gmail.enviarCorreoConArchivo("Su pedido ya fue entregado", "Gracias por su compra", pedido.getCliente().getEmail(), sucursal.get().getEmail(), archivo.getBody());
                }
            }

        }

        pedidoDb.get().setHoraFinalizacion(pedido.getHoraFinalizacion());

        pedidoRepository.save(pedidoDb.get());

        return new ResponseEntity<>("El pedido ha sido actualizado correctamente", HttpStatus.ACCEPTED);
    }

    @PutMapping("/pedido/{idPedido}/update/{preference}/{idSucursal}")
    @CrossOrigin
    @Transactional
    public ResponseEntity<String> updateEstadoPedidoMercadopago(@PathVariable("idPedido") Long idPedido, @PathVariable("preference") String preference, @PathVariable("idSucursal") Long idSucursal) {
        Optional<Pedido> pedidoDb = pedidoRepository.findByIdPedidoAndPreferenceAndIdSucursal(idPedido, preference, idSucursal);

        if (pedidoDb.isEmpty()) {
            return new ResponseEntity<>("La pedido no se encontró", HttpStatus.BAD_REQUEST);
        }

        pedidoDb.get().setEstado(EnumEstadoPedido.ENTRANTES);

        pedidoRepository.save(pedidoDb.get());

        return new ResponseEntity<>("El pedido ha sido recibido por el restaurante", HttpStatus.ACCEPTED);
    }

    @Transactional
    @CrossOrigin
    @PutMapping("/pedido/delete/{preference}/{idSucursal}")
    public void deletePedidoFallido(@PathVariable("preference") String preference, @PathVariable("idSucursal") Long idSucursal) {

        Optional<Pedido> pedido = pedidoRepository.findByPreference(preference);

        if (pedido.isPresent()) {

            for (DetallesPedido detallesPedido : pedido.get().getDetallesPedido()) {
                reponerStock(detallesPedido, idSucursal);
            }

            pedido.get().setBorrado("SI");
            pedidoRepository.save(pedido.get());
        }
    }

    @GetMapping("/pdf/factura/{idPedido}")
    @CrossOrigin
    public ResponseEntity<byte[]> generarFacturaPDF(@PathVariable Long idPedido) {
        Optional<Pedido> pedidoDB = pedidoRepository.findById(idPedido);

        if (pedidoDB.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pedido pedido = pedidoDB.get();
        Optional<Factura> factura = facturaRepository.findByIdPedido(pedido.getId());

        if (factura.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Título principal
            Paragraph title = new Paragraph("EL BUEN SABOR", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, BaseColor.BLACK));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // Espacio
            document.add(new Paragraph(" "));


            // Información de la factura
            Paragraph facturaInfo = new Paragraph("Factura del Pedido", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK));
            facturaInfo.setAlignment(Element.ALIGN_CENTER);
            document.add(facturaInfo);
            document.add(new Paragraph("Tipo: " + factura.get().getTipoFactura().toString()));
            document.add(new Paragraph("Cliente: " + pedido.getCliente().getNombre()));
            document.add(new Paragraph(" "));

            // Detalles de la factura
            Paragraph detalleTitle = new Paragraph("Detalles de la Factura", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK));
            detalleTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(detalleTitle);
            document.add(new Paragraph(" "));

            // Tabla de detalles
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // Encabezados de la tabla
            PdfPCell cell;

            cell = new PdfPCell(new Phrase("Nombre del Menú"));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);

            cell = new PdfPCell(new Phrase("Cantidad"));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);

            cell = new PdfPCell(new Phrase("Subtotal"));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);

            double total = 0;
            for (DetallesPedido detalle : pedido.getDetallesPedido()) {
                if (detalle.getArticuloVenta() != null) {
                    table.addCell(detalle.getArticuloVenta().getNombre());
                    table.addCell(String.valueOf(detalle.getCantidad()));
                    table.addCell(String.valueOf(detalle.getCantidad() * detalle.getArticuloVenta().getPrecioVenta()));
                    total += detalle.getCantidad() * detalle.getArticuloVenta().getPrecioVenta();
                } else if (detalle.getArticuloMenu() != null) {
                    table.addCell(detalle.getArticuloMenu().getNombre());
                    table.addCell(String.valueOf(detalle.getCantidad()));
                    table.addCell(String.valueOf(detalle.getCantidad() * detalle.getArticuloMenu().getPrecioVenta()));
                    total += detalle.getCantidad() * detalle.getArticuloMenu().getPrecioVenta();
                }
            }

            document.add(table);

            // Total de la factura
            Paragraph totalParagraph = new Paragraph("Total: " + total, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK));
            totalParagraph.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalParagraph);

            document.close();

            byte[] pdfBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=factura" + factura.get().getId() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (DocumentException | IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
