package com.springboot.MyTodoList.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "PROYECTO")
public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PROYECTO")
    int id_proyecto;
    @Column(name = "ID_MANAGER")
    int idManager;
    @Column(name = "NOMBRE")
    String nombre;
    @Column(name = "DESCRIPCION")
    String descripcion;
    @Column(name = "DELETED")
    boolean deleted;

    public Proyecto(){}

    public Proyecto(int ID, int id_man, String name, String descripcion, boolean deleted){
        this.id_proyecto = ID;
        this.nombre = name;
        this.idManager = id_man;
        this.descripcion = descripcion;
        this.deleted = deleted;
    }

    public int getID(){
        return id_proyecto;
    }

    public void setID(int Id){
        this.id_proyecto = Id;
    }

    public int getIdManager(){
        return idManager;
    }

    public void setIdManager(int id_manager){
        this.idManager = id_manager;
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

    public boolean getDeleted(){
        return deleted;
    }

    public void setDeleted(boolean deleted){
        this.deleted = deleted;
    }
}