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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;

@RestController
@RequestMapping("/pruebas")
public class TareaController {
    @Autowired
    private TareaService tareaService;

    @GetMapping(value = "/Tareas")
    public List<Tarea> getAllTareas(){
        return tareaService.findAll();
    }

    @GetMapping(value = "/TareasNoAceptadas")
    public List<Tarea> getAllTareasNoAceptadas(){
        return tareaService.findAllNotAccepted();
    }

    @GetMapping(value = "/Tareas/{id}")
    public ResponseEntity<Tarea> getTareaById(@PathVariable int id){
        try{
            ResponseEntity<Tarea> responseEntity = tareaService.getItemById(id);
            return new ResponseEntity<Tarea>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/TareasUsuario/{id}")
    public List<Tarea> getAllTareasAceptadasDeveloper(@PathVariable int id){
        return tareaService.findAllTasksFromProjectForUser(id);
    }

    @GetMapping(value = "/TareasCompletasUsuario/{id}")
    public List<Tarea> getAllTareasDeveloper(@PathVariable int id){
        return tareaService.findEveryTasksFromProjectForUser(id);
    }

    @GetMapping(value = "/TareasProyecto/{id}")
    public List<Tarea> getAllTareasAceptadasProyecto(@PathVariable int id){
        return tareaService.findAllTasksFromProject(id);
    }

    @GetMapping(value = "/TareasNoAceptadasProyecto/{id}")
    public List<Tarea> getAllTareasNoAceptadasProyecto(@PathVariable int id){
        return tareaService.findAllNotAcceptedFromProject(id);
    }

    @GetMapping(value = "/TareasSprint/{id}")
    public List<Tarea> getAllTareasAceptadasSprint(@PathVariable int id){
        return tareaService.findAllTasksFromSprintForManager(id);
    }

    @PostMapping(value = "/Tareas")
    public ResponseEntity addTarea(@RequestBody Tarea Tarea_p) throws Exception{
        Tarea dbTarea = tareaService.addTarea(Tarea_p);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+dbTarea.getIdTarea());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }

    @PutMapping(value = "updateTarea/{id}")
    public ResponseEntity updateTarea(@RequestBody Tarea Tarea, @PathVariable int id){
        try{
            Tarea dbTarea = tareaService.updateTarea(id, Tarea);
            System.out.println(dbTarea.toString());
            return new ResponseEntity<>(dbTarea,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "deleteTarea/{id}")
    public ResponseEntity<Boolean> deleteTarea(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = tareaService.deleteTarea(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}
