package com.springboot.MyTodoList.model;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Entity
@Table(name = "USUARIO")
public class Usuario implements UserDetails {
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
    @Column(name = "PASSWORD")
    String password;
    @Column(name = "FECHACREACION")
    OffsetDateTime  fechaCreacion;
    @Column(name = "MANAGER")
    boolean  manager;
    @Column(name = "DELETED")
    boolean deleted;
    @Column(name = "ID_TELEGRAM")
    Long idTelegram;

    public Usuario(
        int id_usuario,
        String username,
        String nombre,
        String correo,
        String telefono,
        String password,
        OffsetDateTime fechaCreacion,
        boolean manager,
        boolean deleted,
        Long idTelegram
    ) {
        this.id_usuario = id_usuario;
        this.username = username;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.password = password;
        this.fechaCreacion = fechaCreacion;
        this.manager = manager;
        this.deleted = deleted;
        this.idTelegram = idTelegram;
    }

    public Usuario(){}

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(manager ? "MANAGER" : "DEVELOPER"));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return correo;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public int getID(){
        return id_usuario;
    }

    public void setID(int Id){
        this.id_usuario = Id;
    }

    public Long getIdTelegram(){
        return idTelegram;
    }

    public void setIdTelegram(Long id_telegram){
        this.idTelegram = id_telegram;
    }
    
    public String getUsernameModel(){
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

    public String getPasswordModel(){
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