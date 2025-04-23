package com.springboot.MyTodoList.controller.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequestTelefono {
    private String telefono;
    String password;

    public String getTelefono(){
        return this.telefono;
    }

    public void setTelefono(String telefono){
        this.telefono = telefono; 
    }    
    
    public String getPassword(){
        return this.password;
    }

    public void setPassword(String telefono){
        this.telefono = password; 
    }    
}
