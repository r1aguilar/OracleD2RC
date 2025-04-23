package com.springboot.MyTodoList.controller.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String usuario;
    private String nombre;
    private String correo;
    private String telefono;
    private String password;
    private String fechaCreacion;   
    private Boolean manager;
    private Boolean deleted;
}
