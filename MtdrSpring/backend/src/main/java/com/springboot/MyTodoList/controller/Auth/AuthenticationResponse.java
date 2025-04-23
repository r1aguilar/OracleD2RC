package com.springboot.MyTodoList.controller.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class AuthenticationResponse {
    private int id;
    private String token;

    public AuthenticationResponse(int id, String token){
        this.id = id;
        this.token = token;
    }

    public int getId(){
        return this.id;
    }

    public String getToken(){
        return this.token;
    }
}
