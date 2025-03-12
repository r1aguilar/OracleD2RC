package com.springboot.MyTodoList.model;

import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "SPRINTS")
public class Sprints {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_SPRINT")
    int idSprint;
    @Column(name = "ID_PROYECTO")
    int idProyecto;
    @Column(name = "NOMBRE")
    String nombre;
    @Column(name = "DESCRIPCION")
    String descripcion;
    @Column(name = "FECHAINICIO")
    OffsetDateTime  fechaInicio;
    @Column(name = "FECHAFIN")
    OffsetDateTime  fechaFin;
    @Column(name = "COMPLETADO")
    boolean completado;
    @Column(name = "DELETED")
    boolean deleted;

    public Sprints(){}

    public Sprints(int ID, int idProyecto, String name, String descripcion, OffsetDateTime fechaIni, OffsetDateTime fechaFin, boolean completado, boolean deleted){
        this.idSprint = ID;
        this.idProyecto = idProyecto;
        this.nombre = name;
        this.descripcion = descripcion;
        this.fechaInicio = fechaIni;
        this.fechaFin = fechaFin;
        this.completado = completado;
        this.deleted = deleted;
    }

    public int getID(){
        return idSprint;
    }

    public void setID(int Id){
        this.idSprint = Id;
    }

    public int getIdProyecto(){
        return idProyecto;
    }

    public void setIdProyecto(int id_proyecto){
        this.idProyecto = id_proyecto;
    }
    
    public String getNombre(){
        return nombre;
    }
    
    public void setNombre(String name){
        this.nombre = name;
    }

    public String getDescripcion(){
        return descripcion;
    }
    
    public void setDescripcion(String descripcion){
        this.descripcion = descripcion;
    }

    public OffsetDateTime getFechaInicio(){
        return fechaInicio;
    }

    public void setFechaInicio(OffsetDateTime fechaIni){
        this.fechaInicio = fechaIni;
    }

    public OffsetDateTime getFechaFin(){
        return fechaFin;
    }

    public void setFechaFin(OffsetDateTime fechaFin){
        this.fechaFin = fechaFin;
    }

    public boolean getCompletado(){
        return completado;
    }

    public void setCompletado(boolean completado){
        this.completado = completado;
    }

    public boolean getDeleted(){
        return deleted;
    }

    public void setDeleted(boolean deleted){
        this.deleted = deleted;
    }
}