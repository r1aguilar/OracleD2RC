package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository UsuarioRepository;

    public List<Usuario> findAll(){
        List<Usuario> Usuarios = UsuarioRepository.findAll();
        return Usuarios;
    }

    public ResponseEntity<Usuario> getItemById(int id){
        Optional<Usuario> userByID = UsuarioRepository.findById(id);
        if (userByID.isPresent()){
            return new ResponseEntity<>(userByID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<Usuario> getItemByTelegramId(Long id_telegram){
        Optional<Usuario> userByTelegramID = UsuarioRepository.findByIdTelegram(id_telegram);
        if (userByTelegramID.isPresent()){
            return new ResponseEntity<>(userByTelegramID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<Usuario> getItemByTelefono(String telefono){
        Optional<Usuario> userByTelefono = UsuarioRepository.findByTelefono(telefono);
        if (userByTelefono.isPresent()){
            return new ResponseEntity<>(userByTelefono.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<Usuario> loginByTelefono(String telefono, String password){
        Optional<Usuario> userByTelefono = UsuarioRepository.findByTelefonoAndPassword(telefono, password);
        if (userByTelefono.isPresent()){
            return new ResponseEntity<>(userByTelefono.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<Usuario> loginByCorreo(String correo, String password){
        Optional<Usuario> userByCorreo = UsuarioRepository.findByCorreoAndPassword(correo, password);
        if (userByCorreo.isPresent()){
            return new ResponseEntity<>(userByCorreo.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Usuario addUsuario(Usuario Usuario){
        return UsuarioRepository.save(Usuario);
    }

    public boolean deleteUsuario(int id){
        try{
            UsuarioRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    public Usuario updateUsuario(int id, Usuario td){
        Optional<Usuario> UsuarioData = UsuarioRepository.findById(id);
        if(UsuarioData.isPresent()){
            Usuario Usuario = UsuarioData.get();
            Usuario.setID(id);
            Usuario.setNombre(td.getNombre());
            Usuario.setTelefono(td.getTelefono());
            Usuario.setCorreo(td.getCorreo());
            Usuario.setPassword(td.getPassword());
            Usuario.setDeleted(td.getDeleted());
            Usuario.setIdTelegram(td.getIdTelegram());
            return UsuarioRepository.save(Usuario);
        }else{
            return null;
        }
    }
}
