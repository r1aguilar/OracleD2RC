package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRespositories.TareaRepository;

@Service
public class TareaService {

    private static final Logger logger = LoggerFactory.getLogger(TareaService.class);

    @PersistenceContext
    private EntityManager entityManager;

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

    public List<Tarea> findEveryTasksFromProjectForUser(int idEncargado){
        List<Tarea> tareasTotales = tareaRepository.findByIdEncargado(idEncargado);
        return tareasTotales;
    }

    public List<Tarea> findAllTasksFromProject(int idProyecto){
        List<Tarea> tareasAceptadasDelProyecto = tareaRepository.findByAceptadaAndIdProyecto(1, idProyecto);
        return tareasAceptadasDelProyecto;
    }

    public List<Tarea> findAllNotAcceptedTasksFromProject(int idProyecto){
        List<Tarea> tareasAceptadasDelProyecto = tareaRepository.findByIdProyecto(idProyecto);
        return tareasAceptadasDelProyecto;
    }

    public List<Tarea> findAllTasksFromSprintForUserWithColumn(int idSprint, int idEncargado, int idColumna){
        List<Tarea> tareasAceptadasDelSprintDelUsuarioConColumna = tareaRepository.findByAceptadaAndIdSprintAndIdEncargadoAndIdColumna(1, idSprint, idEncargado, idColumna);
        return tareasAceptadasDelSprintDelUsuarioConColumna;
    }

    public List<Tarea> findAllTasksFromProjectForUserWithColumn(int idEncargado, int idColumna){
        List<Tarea> tareasAceptadaDelUsuarioConColumna = tareaRepository.findByAceptadaAndIdEncargadoAndIdColumna(1, idEncargado, idColumna);
        return tareasAceptadaDelUsuarioConColumna;
    }

    public List<Tarea> findAllTasksFromSprintForManager(int idSprint){
        List<Tarea> tareasAceptadasDelSprintParaManager = tareaRepository.findByAceptadaAndIdSprint(1, idSprint);
        return tareasAceptadasDelSprintParaManager;
    }

    public List<Tarea> findAllTasksFromBacklogForManager(int idProyecto){
        List<Tarea> tareasAceptadasDelBacklogParaManager = tareaRepository.findByAceptadaAndIdProyectoAndIdSprintIsNull(1, idProyecto);
        return tareasAceptadasDelBacklogParaManager;
    }

    public List<Tarea> findAllTasksInSprintForUser(int idSprint, int idEncargado){
        List<Tarea> tareasNoAceptadas = tareaRepository.findByAceptadaAndIdSprintAndIdEncargado(1, idSprint, idEncargado);
        return tareasNoAceptadas;
    }

    public List<Tarea> findAllTasksFromSprintWithColumn(int idSprint, int idColumn){
        List<Tarea> tareasAceptadasDelSprintParaManager = tareaRepository.findByAceptadaAndIdSprintAndIdColumna(1, idSprint, idColumn);
        return tareasAceptadasDelSprintParaManager;
    }

    public List<Tarea> findAllTasksFromProjectWithColumn(int idProyecto, int idColumn){
        List<Tarea> tareasAceptadasDelSprintParaManager = tareaRepository.findByAceptadaAndIdProyectoAndIdColumna(1, idProyecto, idColumn);
        return tareasAceptadasDelSprintParaManager;
    }

    public long countAllTasksFromSprint(int idSprint){
        return tareaRepository.countByAceptadaAndIdSprint(1, idSprint);
    }

    public long countAllTasksFromSprintAndColumn(int idSprint, int idColumna){
        return tareaRepository.countByAceptadaAndIdSprintAndIdColumna(1, idSprint, idColumna);
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
            Tarea.setTiempoEstimado(td.getTiempoEstimado());
            Tarea.setPrioridad(td.getPrioridad());
            Tarea.setAceptada(td.getAceptada());
            Tarea.setDeleted(td.getDeleted());
            return tareaRepository.save(Tarea);
        }else{
            return null;
        }
    }

    public Tarea updateTareaWithProcedure(Tarea tarea) {
        return tareaRepository.updateTareaProcedure(tarea);
    }
}
