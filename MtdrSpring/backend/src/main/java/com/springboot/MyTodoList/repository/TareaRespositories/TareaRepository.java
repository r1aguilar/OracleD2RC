package com.springboot.MyTodoList.repository.TareaRespositories;


import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.Tarea;

@Repository
@Transactional
@EnableTransactionManagement
public interface TareaRepository extends JpaRepository<Tarea,Integer>, TareaRepositoryCustom {
    List<Tarea> findByAceptada(int aceptada);
    List<Tarea> findByAceptadaAndIdProyecto(int aceptada, int idProyecto);
    List<Tarea> findByAceptadaAndIdSprint(int aceptada, int idSprint);
    List<Tarea> findByAceptadaAndIdProyectoAndIdSprintIsNull(int aceptada, int idProyecto);
    List<Tarea> findByAceptadaAndIdSprintAndIdEncargado(int aceptada, int idSprint, int idEncargado);
    List<Tarea> findByAceptadaAndIdEncargado(int aceptada, int idEncargado);
    List<Tarea> findByAceptadaAndIdSprintAndIdEncargadoAndIdColumna(int aceptada, int idSprint, int idEncargado, int idColumna);
    List<Tarea> findByAceptadaAndIdEncargadoAndIdColumna(int aceptada, int idEncargado, int idColumna);
}

