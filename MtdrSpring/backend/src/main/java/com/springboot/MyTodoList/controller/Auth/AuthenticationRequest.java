package com.springboot.MyTodoList.controller.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {
    private String correo;
    String password;

    public String getCorreo(){
        return this.correo;
    }

    public void setCorreo(String telefono){
        this.correo = telefono; 
    } 
    
    public String getPassword(){
        return this.password;
    }
}
