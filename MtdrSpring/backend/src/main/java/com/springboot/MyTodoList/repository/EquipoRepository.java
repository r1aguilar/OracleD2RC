package com.springboot.MyTodoList.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.springboot.MyTodoList.model.Equipo;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {
}
