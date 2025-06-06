package com.springboot.MyTodoList.controller;
import java.util.ArrayList;
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

import com.springboot.MyTodoList.model.Equipo;
import com.springboot.MyTodoList.service.EquipoService;

import com.springboot.MyTodoList.model.IntegrantesEquipo;
import com.springboot.MyTodoList.service.IntegrantesEquipoService;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.service.ProyectoService;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;



@RestController
@RequestMapping("/pruebasProy")
public class ProyectoController {
    @Autowired
    private ProyectoService proeyctoService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private EquipoService equipoService;
    @Autowired
    private IntegrantesEquipoService integrantesEquipoService;

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

    @GetMapping(value = "/ProyectosForManager/{idUser}")
    public List<Proyecto> getProyectosForManager(@PathVariable int idUser){
        return proeyctoService.findAllProjectsForManager(idUser);
    }

    @GetMapping(value = "/UsuariosProyecto/{idProy}")
    public List<Usuario> getAllUsersFromProyecto(@PathVariable int idProy){
        // Obtener el id del equipo a traves del proyecto
        Equipo equipo = equipoService.findEquipoByIdProyecto(idProy).getBody();

        // A traves del id del equipo obtener la lista de integrantesEquipo
        List<IntegrantesEquipo> integrantes = integrantesEquipoService.findAllByIdEquipo(equipo.getIdEquipo());

        // Con la lista de intregrantes, ahora a hacer la lista de usuarios
        List<Usuario> usuariosDelEquipo = new ArrayList<>();
        for(IntegrantesEquipo integrante : integrantes){
            usuariosDelEquipo.add(usuarioService.getItemById(integrante.getIdUsuario()).getBody());
        }
        return usuariosDelEquipo;
    }

    @GetMapping(value = "/ProyectoUsuario/{idUser}")
    public ResponseEntity<Integer> getProyectoFromUser(@PathVariable int idUser){
        // Obtener el id del equipo a traves del proyecto
        IntegrantesEquipo integrante = integrantesEquipoService.getItemByIdUsuario(idUser).getBody();

        // A traves del id del equipo obtener la lista de integrantesEquipo
        Equipo equipo = equipoService.getItemById(integrante.getIdEquipo()).getBody();

        return new ResponseEntity<>(equipo.getIdProyecto(), HttpStatus.OK);
    }

    @PostMapping(value = "/addIntegrante/{idUser}/{idProy}")
    public ResponseEntity addIntegrante(@PathVariable int idUser, @PathVariable int idProy) throws Exception{
        Equipo equipo = equipoService.findEquipoByIdProyecto(idProy).getBody();
        IntegrantesEquipo integranteNuevo = new IntegrantesEquipo(idUser, equipo.getIdEquipo(), 1);
        IntegrantesEquipo integranteNuevo_p = integrantesEquipoService.addEquipo(integranteNuevo);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+ integranteNuevo_p.getIdUsuario());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
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
