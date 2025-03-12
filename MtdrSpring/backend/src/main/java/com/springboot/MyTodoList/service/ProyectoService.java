package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.repository.ProyectoRepository;

@Service
public class ProyectoService {

    @Autowired
    private ProyectoRepository proyectoRepository;
    public List<Proyecto> findAll(){
        List<Proyecto> Proyectos = proyectoRepository.findAll();
        return Proyectos;
    }


    public ResponseEntity<Proyecto> getItemById(int id){
        Optional<Proyecto> userByID = proyectoRepository.findById(id);
        if (userByID.isPresent()){
            return new ResponseEntity<>(userByID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    public List<Proyecto> findAllProjectsForManager(int id_manager){
        List<Proyecto> listaProyectos = proyectoRepository.findByIdManager(id_manager);
        return listaProyectos;
    }

    public Proyecto addProyecto(Proyecto Proyecto){
        return proyectoRepository.save(Proyecto);
    }

    public boolean deleteProyecto(int id){
        try{
            proyectoRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    
    public Proyecto updateProyecto(int id, Proyecto td){
        Optional<Proyecto> ProyectoData = proyectoRepository.findById(id);
        if(ProyectoData.isPresent()){
            Proyecto Proyecto = ProyectoData.get();
            Proyecto.setID(id);
            Proyecto.setNombre(td.getNombre());
            Proyecto.setIdManager(td.getIdManager());
            Proyecto.setDescripcion(td.getDescripcion());
            Proyecto.setDeleted(td.getDeleted());
            return proyectoRepository.save(Proyecto);
        }else{
            return null;
        }
    }

}
