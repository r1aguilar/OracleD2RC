package com.springboot.MyTodoList.controller.Auth;

import com.springboot.MyTodoList.model.Usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class AuthenticationResponse {
    private Usuario user;
    private String token;

    public AuthenticationResponse(Usuario user, String token){
        this.user = user;
        this.token = token;
    }

    public Usuario getUser(){
        return this.user;
    }

    public String getToken(){
        return this.token;
    }
}
