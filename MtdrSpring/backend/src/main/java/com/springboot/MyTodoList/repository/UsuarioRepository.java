package com.springboot.MyTodoList.repository;


import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.Usuario;

@Repository
@Transactional
@EnableTransactionManagement
public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {
    Optional<Usuario> findByIdTelegram(Long id_telegram);
    Optional<Usuario> findByTelefono(String telefono);
    Optional<Usuario> findByTelefonoAndPassword(String telefono, String password);
    Optional<Usuario> findByCorreoAndPassword(String correo, String password);
    Optional<Usuario> findByCorreo(String correo);
}

