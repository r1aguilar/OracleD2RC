package com.springboot.MyTodoList.controller.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class AuthenticationRequestTelefono {
    String telefono;
    String password;

    public AuthenticationRequestTelefono(String telefono_p, String pass) {
        this.telefono = telefono_p;
        this.password = pass;
    }

    public AuthenticationRequestTelefono() {
    }

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
