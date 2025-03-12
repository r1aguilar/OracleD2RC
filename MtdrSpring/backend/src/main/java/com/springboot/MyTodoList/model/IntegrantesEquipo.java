package com.springboot.MyTodoList.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "INTEGRANTES_EQUIPO")
public class IntegrantesEquipo {

    @Id
    @Column(name = "ID_USUARIO")
    private int idUsuario;

    @Column(name = "ID_EQUIPO")
    private int idEquipo;

    @Column(name = "ID_ROL", nullable = false)
    private int idRol;

    public IntegrantesEquipo() {}

    public IntegrantesEquipo(int id_usuario, int id_equipo, int idRol) {
        this.idUsuario = id_usuario;
        this.idEquipo = id_equipo;
        this.idRol = idRol;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int id_usuario) {
        this.idUsuario = id_usuario;
    }

    public int getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(int id_equipo) {
        this.idEquipo = id_equipo;
    }

    public int getIdRol() {
        return idRol;
    }

    public void setIdRol(int idRol) {
        this.idRol = idRol;
    }
}
