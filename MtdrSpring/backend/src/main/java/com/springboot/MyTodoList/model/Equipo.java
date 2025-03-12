package com.springboot.MyTodoList.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "EQUIPO")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_EQUIPO")
    private int idEquipo;

    @Column(name = "ID_PROYECTO")  // 🔹 Aquí está la corrección
    private int idProyecto;

    @Column(name = "NOMBREEQUIPO")
    private String nombreEquipo;

    @Column(name = "DESCRIPCIONEQUIPO")  // 🔹 Aquí está la corrección
    private String descripcionEquipo;

    @Column(name = "NUMINTEGRANTESEQUIPO")  // 🔹 Aquí está la corrección
    private Integer numIntegrantes;

    @Column(name = "DELETED")  // 🔹 Aquí está la corrección
    private boolean deleted;

    // Getters y Setters
    public int getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(int idEquipo) {
        this.idEquipo = idEquipo;
    }

    public int getIdProyecto() {
        return idProyecto;
    }

    public void setIdProyecto(int idProyecto) {
        this.idProyecto = idProyecto;
    }

    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    public String getDescripcionEquipo() {
        return descripcionEquipo;
    }

    public void setDescripcionEquipo(String descripcionEquipo) {
        this.descripcionEquipo = descripcionEquipo;
    }

    public Integer getNumIntegrantes() {
        return numIntegrantes;
    }

    public void setNumIntegrantes(Integer numIntegrantes) {
        this.numIntegrantes = numIntegrantes;
    }

    public boolean getDeleted(){
        return deleted;
    }

    public void setDeleted(boolean deleted){
        this.deleted = deleted;
    }
}

