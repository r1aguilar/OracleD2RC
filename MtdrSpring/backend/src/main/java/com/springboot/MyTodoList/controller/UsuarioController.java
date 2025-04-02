package com.springboot.MyTodoList.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;

@RestController
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping(value = "/usuarios")
    public List<Usuario> getAllUsuarios(){
        return usuarioService.findAll();
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

    @GetMapping(value = "/login/{telefono}/{contrasena}")
    public ResponseEntity<Usuario> loginUsuario(@PathVariable String telefono, @PathVariable String contrasena) {
        try {
            ResponseEntity<Usuario> responseEntity = usuarioService.loginByTelefono(telefono, contrasena);
            return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping(value = "/login/email/{correo}/{contrasena}")
    public ResponseEntity<Usuario> loginUsuarioPorCorreo(@PathVariable String correo, @PathVariable String contrasena) {
        try {
            ResponseEntity<Usuario> responseEntity = usuarioService.loginByCorreo(correo, contrasena);
            return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
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
