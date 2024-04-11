package main.entities.Restaurante.Menu;

import jakarta.persistence.*;
import main.entities.Restaurante.Restaurante;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "stock", schema = "buen_sabor")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "cantidad")
    private int cantidad;
    @Column(name = "medida")
    private String medida;
    @Column(name = "fecha_llegada", updatable = false, nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    public Date fechaLlegada;
    @Column(name = "borrado")
    private String borrado;
    @ManyToOne
    @JoinColumn(name = "id_restaurante")
    private Restaurante restaurante;
    @OneToOne
    private Ingrediente ingrediente;

    public Stock() {
    }

    public Stock(int cantidad, String medida, Restaurante restaurante, Ingrediente ingrediente) {
        this.cantidad = cantidad;
        this.medida = medida;
        this.restaurante = restaurante;
        this.ingrediente = ingrediente;
    }

    public String getBorrado() {
        return borrado;
    }

    public void setBorrado(String borrado) {
        this.borrado = borrado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public String getMedida() {
        return medida;
    }

    public void setMedida(String medida) {
        this.medida = medida;
    }

    public Restaurante getRestaurante() {
        return restaurante;
    }

    public void setRestaurante(Restaurante idRestaurante) {
        this.restaurante = idRestaurante;
    }

    public Ingrediente getIngrediente() {
        return ingrediente;
    }

    public void setIngrediente(Ingrediente ingrediente) {
        this.ingrediente = ingrediente;
    }

    public Date getFechaLlegada() {
        return fechaLlegada;
    }

    public void setFechaLlegada(Date fechaLlegada) {
        this.fechaLlegada = fechaLlegada;
    }
}
