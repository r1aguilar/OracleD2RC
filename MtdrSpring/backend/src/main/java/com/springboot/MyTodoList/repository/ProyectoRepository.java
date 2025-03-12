package com.springboot.MyTodoList.repository;


import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.Proyecto;

@Repository
@Transactional
@EnableTransactionManagement
public interface ProyectoRepository extends JpaRepository<Proyecto,Integer> {
   List<Proyecto> findByIdManager(int id_manager);
}

