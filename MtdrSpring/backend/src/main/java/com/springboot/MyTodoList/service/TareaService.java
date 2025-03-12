package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRepository;

@Service
public class TareaService {

    @Autowired
    private TareaRepository tareaRepository;

    public List<Tarea> findAll(){
        List<Tarea> tareas = tareaRepository.findAll();
        return tareas;
    }

    public List<Tarea> findAllNotAccepted(){
        List<Tarea> tareasNoAceptadas = tareaRepository.findByAceptada(0);
        return tareasNoAceptadas;
    }

    public List<Tarea> findAllNotAcceptedFromProject(int id_proyecto){
        List<Tarea> tareasNoAceptadas = tareaRepository.findByAceptadaAndIdProyecto(0, id_proyecto);
        return tareasNoAceptadas;
    }

    public List<Tarea> findAllTasksFromProjectForUser(int idEncargado){
        List<Tarea> tareasNoAceptadas = tareaRepository.findByAceptadaAndIdEncargado(1, idEncargado);
        return tareasNoAceptadas;
    }

    public List<Tarea> findAllTasksInSprintForUser(int idSprint, int idEncargado){
        List<Tarea> tareasNoAceptadas = tareaRepository.findByAceptadaAndIdSprintAndIdEncargado(1, idSprint, idEncargado);
        return tareasNoAceptadas;
    }

    public ResponseEntity<Tarea> getItemById(int id){
        Optional<Tarea> userByID = tareaRepository.findById(id);
        if (userByID.isPresent()){
            return new ResponseEntity<>(userByID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Tarea addTarea(Tarea Tarea){
        return tareaRepository.save(Tarea);
    }

    public boolean deleteTarea(int id){
        try{
            tareaRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    // Funcion que hace update de los datos de una tarea mandandole esa misma tarea con los nuevos datos
    public Tarea updateTarea(int id, Tarea td){
        Optional<Tarea> TareaData = tareaRepository.findById(id);
        if(TareaData.isPresent()){
            Tarea Tarea = TareaData.get();
            Tarea.setIdTarea(td.getIdTarea());
            Tarea.setIdEncargado(td.getIdEncargado());
            Tarea.setIdProyecto(td.getIdProyecto());
            Tarea.setIdColumna(td.getIdColumna());
            Tarea.setIdSprint(td.getIdSprint());
            Tarea.setNombre(td.getNombre());
            Tarea.setDescripcion(td.getDescripcion());
            Tarea.setfechaInicio(td.getfechaInicio());
            Tarea.setFechaVencimiento(td.getFechaVencimiento());
            Tarea.setFechaCompletado(td.getFechaCompletado());
            Tarea.setStoryPoints(td.getStoryPoints());
            Tarea.setTiempoReal(td.getTiempoReal());
            Tarea.setPrioridad(td.getPrioridad());
            Tarea.setAceptada(td.getAceptada());
            Tarea.setDeleted(td.getDeleted());
            return tareaRepository.save(Tarea);
        }else{
            return null;
        }
    }

}
