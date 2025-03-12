package com.springboot.MyTodoList.model;

import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "USUARIO")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USUARIO")
    int id_usuario;
    @Column(name = "USUARIO")
    String username;
    @Column(name = "NOMBRE")
    String nombre;
    @Column(name = "CORREO")
    String correo;
    @Column(name = "TELEFONO", unique = true)
    String telefono;
    @Column(name = "PASS")
    String password;
    @Column(name = "FECHACREACION")
    OffsetDateTime  fechaCreacion;
    @Column(name = "MANAGER")
    boolean  manager;
    @Column(name = "DELETED")
    boolean deleted;
    @Column(name = "ID_TELEGRAM")
    Long idTelegram;

    public Usuario(){}

    public Usuario(int ID, String username, String name, String correo_p, String phone, String password, OffsetDateTime fecha_creacion, boolean manager, boolean deleted, Long id_telegram){
        this.id_usuario = ID;
        this.username = username;
        this.nombre = name;
        this.correo = correo_p;
        this.telefono = phone;
        this.fechaCreacion = fecha_creacion;
        this.password = password;
        this.manager = manager;
        this.deleted = deleted;
        this.idTelegram = id_telegram;
    }

    public int getID(){
        return id_usuario;
    }

    public void setID(int Id){
        this.id_usuario = Id;
    }

    public long getIdTelegram(){
        return idTelegram;
    }

    public void setIdTelegram(Long id_telegram){
        this.idTelegram = id_telegram;
    }
    
    public String getUsername(){
        return username;
    }
    
    public void setUsername(String username){
        this.username = username;
    }
    
    public String getNombre(){
        return nombre;
    }
    
    public void setNombre(String name){
        this.nombre = name;
    }
    
    public String getCorreo(){
        return correo;
    }

    public void setCorreo(String correo){
        this.correo = correo;
    }

    public String getTelefono(){
        return telefono;
    }

    public void setTelefono(String tel){
        this.telefono = tel;
    }

    public String getPassword(){
        return password;
    }

    public void setPassword(String pass){
        this.password = pass;
    }

    public boolean getDeleted(){
        return deleted;
    }

    public void setDeleted(boolean deleted){
        this.deleted = deleted;
    }

    public boolean getManager(){
        return manager;
    }

    public void setManager(boolean manager){
        this.manager = manager;
    }

    public OffsetDateTime getFechaCreacion(){
        return this.fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion_p){
        this.fechaCreacion = fechaCreacion_p;
    }
}