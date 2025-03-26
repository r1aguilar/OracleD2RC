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
    Integer idColumna;

    @Column(name = "ID_SPRINT")
    Integer idSprint;

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
    Integer storyPoints;

    @Column(name = "TIEMPOREAL")
    Integer tiempoReal;

    @Column(name = "TIEMPOESTIMADO")
    Integer tiempoEstimado;

    @Column(name = "PRIORIDAD")
    Integer prioridad;

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

    public void setIdColumna(Integer idColumna) {
        this.idColumna = idColumna;
    }

    public Integer getIdSprint() {
        return idSprint;
    }

    public void setIdSprint(Integer idSprint) {
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

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public Integer getTiempoReal() {
        return tiempoReal;
    }

    public void setTiempoReal(Integer tiempoReal) {
        this.tiempoReal = tiempoReal;
    }

    public Integer getTiempoEstimado() {
        return tiempoEstimado;
    }

    public void setTiempoEstimado(Integer tiempoEstimado) {
        this.tiempoEstimado = tiempoEstimado;
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