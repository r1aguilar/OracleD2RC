package com.springboot.MyTodoList.controller;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import com.springboot.MyTodoList.model.Sprints;
import com.springboot.MyTodoList.service.SprintsService;
import com.springboot.MyTodoList.service.TareaService;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@RestController
@RequestMapping("/pruebasSprint")
public class SprintsController {
    @Autowired
    private SprintsService sprintsService;
    @Autowired
    private TareaService tareaService;

    @GetMapping(value = "/Sprints")
    public List<Sprints> getAllSprints(){
        return sprintsService.findAll();
    }

    @GetMapping(value = "/SprintsForKPIs/{idProy}")
        public List<Map<String, Object>> getAllSprintsFromProjectForKPIs(@PathVariable int idProy) {
        List<Map<String, Object>> response = new ArrayList<>();
        List<Sprints> sprints = sprintsService.findAllSprintsFromProject(idProy);
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        for (Sprints sprint : sprints) {
            // Convert the sprint object to a Map automatically
            Map<String, Object> sprintMap = mapper.convertValue(sprint, Map.class);
            
            // Add your new fields
            Long tareasCompletadasSprint = tareaService.countAllTasksFromSprint(sprint.getID());
            Long tareasTotalesSprint = tareaService.countAllTasksFromSprintAndColumn(sprint.getID(), 3);
            sprintMap.put("tareasCompletadas", tareasCompletadasSprint);
            sprintMap.put("tareasTotales", tareasTotalesSprint);
    
            response.add(sprintMap);
        }

        return response;
    }


    @GetMapping(value = "/Sprints/{id}")
    public ResponseEntity<Sprints> getSprintsById(@PathVariable int id){
        try{
            ResponseEntity<Sprints> responseEntity = sprintsService.getItemById(id);
            return new ResponseEntity<Sprints>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/Sprints")
    public ResponseEntity addSprints(@RequestBody Sprints Sprints_p) throws Exception{
        Sprints dbSprints = sprintsService.addSprints(Sprints_p);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+dbSprints.getID());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }

    @PutMapping(value = "updateSprint/{id}")
    public ResponseEntity updateSprints(@RequestBody Sprints Sprints, @PathVariable int id){
        try{
            Sprints dbSprints = sprintsService.updateSprints(id, Sprints);
            System.out.println(dbSprints.toString());
            return new ResponseEntity<>(dbSprints,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "deleteSprint/{id}")
    public ResponseEntity<Boolean> deleteSprints(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = sprintsService.deleteSprints(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}
