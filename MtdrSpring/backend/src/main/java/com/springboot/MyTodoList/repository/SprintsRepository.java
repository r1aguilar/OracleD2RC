package com.springboot.MyTodoList.repository;


import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.Sprints;

@Repository
@Transactional
@EnableTransactionManagement
public interface SprintsRepository extends JpaRepository<Sprints,Integer> {
   List<Sprints> findByIdProyecto(int idProyecto);
}

