package com.springboot.MyTodoList.controller;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.IntegrantesEquipo;

import com.springboot.MyTodoList.service.SprintsService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.IntegrantesEquipoService;
import com.springboot.MyTodoList.service.EquipoService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.springboot.MyTodoList.model.Equipo;

@RestController
@RequestMapping("/pruebasSprint")
public class SprintsController {
    @Autowired
    private SprintsService sprintsService;
    @Autowired
    private TareaService tareaService;
    @Autowired
    private IntegrantesEquipoService integrantesEquipoService;
    @Autowired
    private EquipoService equipoService;

    private static final Logger logger = LoggerFactory.getLogger(TareaService.class);

    @GetMapping(value = "/Sprints")
    public List<Sprints> getAllSprints(){
        return sprintsService.findAll();
    }

    @GetMapping(value = "/SprintsForUser/{idUser}")
    public List<Sprints> getAllSprintsForUser(@PathVariable int idUser) {
        IntegrantesEquipo user = integrantesEquipoService.getItemByIdUsuario(idUser).getBody();
        Equipo equipo = equipoService.getItemById(user.getIdEquipo()).getBody();
        return sprintsService.findAllSprintsFromProject(equipo.getIdProyecto());
    }

    @GetMapping(value = "/SprintsForProject/{idProy}")
    public List<Sprints> getAllSprintsForProject(@PathVariable int idProy) {
        return sprintsService.findAllSprintsFromProject(idProy);
    }

    @PostMapping(value = "/CompleteSprint/{idSprint}")
    public ResponseEntity completeSprint(@RequestBody Sprints sprint, @PathVariable int idSprint) {
        try {
            // Obtener la hora actual en UTC-6
            OffsetDateTime nowUtcMinus6 = OffsetDateTime.now(ZoneOffset.ofHours(-6));

            if (nowUtcMinus6.isBefore(sprint.getFechaFin())) {
                return new ResponseEntity<>("El sprint aún no puede ser completado.", HttpStatus.BAD_REQUEST);
            }

            // Completar el sprint
            sprintsService.updateSprints(idSprint, sprint);

            // Buscar el siguiente sprint no completado del mismo proyecto
            List<Sprints> sprints = sprintsService.findAllSprintsFromProject(sprint.getIdProyecto());
            Optional<Sprints> siguienteSprint = sprints.stream()
                    .filter(s -> !s.getCompletado() && s.getID() != idSprint)
                    .sorted(Comparator.comparing(Sprints::getFechaInicio))
                    .findFirst();


            // Obtener las tareas del sprint actual
            List<Tarea> tareas = tareaService.findAllTasksFromSprintForManager(idSprint);

            // Filtrar tareas que no están completadas (columna != 3)
            List<Tarea> tareasNoCompletadas = tareas.stream()
                    .filter(t -> t.getIdColumna() != 3)
                    .collect(Collectors.toList());

            // Mover tareas
            for (Tarea tarea : tareasNoCompletadas) {
                if (siguienteSprint.isPresent()) {
                    logger.debug(Integer.toString(siguienteSprint.get().getID()));
                    tarea.setIdSprint(siguienteSprint.get().getID());
                    tarea.setfechaInicio(siguienteSprint.get().getFechaInicio());
                    tarea.setFechaVencimiento(siguienteSprint.get().getFechaFin());
                } else {
                    tarea.setIdSprint(null);
                    tarea.setfechaInicio(null);
                    tarea.setFechaVencimiento(null);
                }
                tareaService.updateTarea(tarea.getIdTarea(), tarea);
            }

            return new ResponseEntity<>(null, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
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
