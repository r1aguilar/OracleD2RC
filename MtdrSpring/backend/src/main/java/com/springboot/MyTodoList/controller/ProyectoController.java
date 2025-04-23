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

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.service.ProyectoService;

@RestController
@RequestMapping("/pruebasProy")
public class ProyectoController {
    @Autowired
    private ProyectoService proeyctoService;

    @GetMapping(value = "/Proyectos")
    public List<Proyecto> getAllProyectos(){
        return proeyctoService.findAll();
    }

    @GetMapping(value = "/Proyectos/{id}")
    public ResponseEntity<Proyecto> getProyectoById(@PathVariable int id){
        try{
            ResponseEntity<Proyecto> responseEntity = proeyctoService.getItemById(id);
            return new ResponseEntity<Proyecto>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/Proyectos")
    public ResponseEntity addProyecto(@RequestBody Proyecto Proyecto_p) throws Exception{
        Proyecto dbProyecto = proeyctoService.addProyecto(Proyecto_p);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+dbProyecto.getID());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }

    @PutMapping(value = "updateProyecto/{id}")
    public ResponseEntity updateProyecto(@RequestBody Proyecto Proyecto, @PathVariable int id){
        try{
            Proyecto dbProyecto = proeyctoService.updateProyecto(id, Proyecto);
            System.out.println(dbProyecto.toString());
            return new ResponseEntity<>(dbProyecto,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "deleteProyecto/{id}")
    public ResponseEntity<Boolean> deleteProyecto(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = proeyctoService.deleteProyecto(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}
