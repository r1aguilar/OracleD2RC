package com.springboot.MyTodoList.controller;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.model.loginRequestCorreo;
import com.springboot.MyTodoList.model.loginRequestTelefono;
import com.springboot.MyTodoList.service.UsuarioService;

import com.springboot.MyTodoList.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/pruebasUser")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("Invalid Authorization header format");
    }

    @GetMapping(value = "/usuarios")
    @PreAuthorize("hasAuthority('MANAGER')")
    public List<Usuario> getAllUsuarios(){
        return usuarioService.findAll();
    }

    @GetMapping(value = "/validarTokenManager")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Boolean> validarTokenManager(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        boolean isValid = !jwtService.expiresInLessThan30Minutes(token);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping(value = "/validarTokenDeveloper")
    @PreAuthorize("hasAuthority('DEVELOPER')")
    public ResponseEntity<Boolean> validarTokenDeveloper(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        boolean isValid = !jwtService.expiresInLessThan30Minutes(token);
        return ResponseEntity.ok(isValid);
    }


    @GetMapping(value = "/usuarios/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id){
        try{
            ResponseEntity<Usuario> responseEntity = usuarioService.getItemById(id);
            return new ResponseEntity<Usuario>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/login")
    public ResponseEntity<Usuario> loginUsuarioPorTelefono(@RequestBody loginRequestTelefono loginRequest) {
        try {
            ResponseEntity<Usuario> responseEntity = usuarioService.loginByTelefono(
                loginRequest.gettelefono(), loginRequest.getPassword()
            );
            return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping(value = "/login/email")
    public ResponseEntity<Object> loginUsuarioPorCorreo(@RequestBody loginRequestCorreo loginRequest) {
        try {
            ResponseEntity<Usuario> responseEntity = usuarioService.loginByCorreo(
                loginRequest.getCorreo(), loginRequest.getPassword()
            );
            return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("correo", loginRequest.getCorreo());
            errorResponse.put("password", loginRequest.getPassword());
            errorResponse.put("errorMessage", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping(value = "/usuarios")
    public ResponseEntity addUsuario(@RequestBody Usuario usuario_p) throws Exception{
        Usuario dbUsuario = usuarioService.addUsuario(usuario_p);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+dbUsuario.getID());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }

    @PutMapping(value = "updateUsuario/{id}")
    public ResponseEntity updateUsuario(@RequestBody Usuario usuario, @PathVariable int id){
        try{
            Usuario dbUsuario = usuarioService.updateUsuario(id, usuario);
            System.out.println(dbUsuario.toString());
            return new ResponseEntity<>(dbUsuario,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping(value = "updateUsuarioProfile/{id}")
    public ResponseEntity updateUsuarioProfile(@RequestBody Usuario usuario, @PathVariable int id){
        try{
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            Usuario dbUsuario = usuarioService.updateUsuario(id, usuario);
            System.out.println(dbUsuario.toString());
            return new ResponseEntity<>(dbUsuario,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "deleteUsuario/{id}")
    public ResponseEntity<Boolean> deleteUsuario(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = usuarioService.deleteUsuario(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}
