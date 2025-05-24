package com.springboot.MyTodoList.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
@Entity
@Table(name = "TOKENS")
public class Token {
    @Id
    @Column(name = "ID_USUARIO")
    private Integer id_usuario;
    @Column(name = "TOKEN")
    private String token;

    public Token(Integer id){
        this.id_usuario = id;
        this.token = null;
    }

    public void setToken(String token){
        this.token = token;
    }

    Token(){}
}
