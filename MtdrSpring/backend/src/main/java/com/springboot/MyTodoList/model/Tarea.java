package com.springboot.MyTodoList.model;

import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table; 

@Entity
@Table(name = "TAREA")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TAREA")
    int idTarea;

    @Column(name = "ID_USUARIO", nullable = true)
    int idEncargado;

    @Column(name = "ID_PROYECTO", nullable = false)
    int idProyecto;

    @Column(name = "ID_COLUMNA")
    int idColumna;

    @Column(name = "ID_SPRINT")
    int idSprint;

    @Column(name = "ACEPTADA")
    int aceptada;

    @Column(name = "NOMBRE", nullable = false)
    String nombre;

    @Column(name = "DESCRIPCION")
    String descripcion;

    @Column(name = "FECHAINICIO")
    OffsetDateTime fechaInicio;

    @Column(name = "FECHAVENCIMIENTO", nullable = false)
    OffsetDateTime fechaVencimiento;

    @Column(name = "FECHACOMPLETADO", nullable = true)
    OffsetDateTime fechaCompletado;

    @Column(name = "STORYPOINTS")
    int storyPoints;

    @Column(name = "TIEMPOREAL")
    String tiempoReal;

    @Column(name = "PRIORIDAD")
    int prioridad;

    @Column(name = "DELETED")
    int deleted;

    public Tarea() {}

    public int getIdTarea() {
        return idTarea;
    }
    
    public int setIdTarea(int id) {
        return idTarea;
    }

    public int getIdEncargado() {
        return idEncargado;
    }

    public void setIdEncargado(int encargado) {
        this.idEncargado = encargado;
    }

    public int getIdProyecto() {
        return idProyecto;
    }

    public void setIdProyecto(int idProyecto){
        this.idProyecto = idProyecto;
    }

    public int getIdColumna() {
        return idColumna;
    }

    public void setIdColumna(int idColumna) {
        this.idColumna = idColumna;
    }

    public int getIdSprint() {
        return idSprint;
    }

    public void setIdSprint(int idSprint) {
        this.idSprint = idSprint;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public OffsetDateTime getfechaInicio() {
        return fechaInicio;
    }

    public void setfechaInicio(OffsetDateTime td_time) {
        this.fechaInicio = td_time;
    }

    public OffsetDateTime getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(OffsetDateTime fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public OffsetDateTime getFechaCompletado() {
        return fechaCompletado;
    }

    public void setFechaCompletado(OffsetDateTime fechaCompletado) {
        this.fechaCompletado = fechaCompletado;
    }

    public int getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(int storyPoints) {
        this.storyPoints = storyPoints;
    }

    public String getTiempoReal() {
        return tiempoReal;
    }

    public void setTiempoReal(String tiempoReal) {
        this.tiempoReal = tiempoReal;
    }

    public int getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(int prioridad) {
        this.prioridad = prioridad;
    }

    public int getDeleted() {
        return deleted;
    }

    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }

    public int getAceptada() {
        return aceptada;
    }

    public void setAceptada(int aceptada) {
        this.aceptada = aceptada;
    }
}