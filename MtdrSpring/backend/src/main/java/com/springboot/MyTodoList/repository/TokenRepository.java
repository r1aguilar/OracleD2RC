package com.springboot.MyTodoList.repository;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.Token;

@Repository
@Transactional
@EnableTransactionManagement
public interface TokenRepository extends JpaRepository<Token, Integer>{
    Optional<Token> findByToken(String token);
}
