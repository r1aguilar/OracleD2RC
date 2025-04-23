package com.springboot.MyTodoList.model;

public class loginRequestCorreo {
    private String correo;
    private String password;

    public String getCorreo(){
        return this.correo;
    }

    public void setCorreo(String correo){
        this.correo = correo;
    }

    public String getPassword(){
        return this.password;
    }

    public void setPassword(String password){
        this.password = password;
    }

}
