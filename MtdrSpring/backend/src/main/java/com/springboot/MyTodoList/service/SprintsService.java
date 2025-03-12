package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Sprints;
import com.springboot.MyTodoList.repository.SprintsRepository;

@Service
public class SprintsService {

    @Autowired
    private SprintsRepository sprintsRepository;
    public List<Sprints> findAll(){
        List<Sprints> Sprints = sprintsRepository.findAll();
        return Sprints;
    }


    public ResponseEntity<Sprints> getItemById(int id){
        Optional<Sprints> userByID = sprintsRepository.findById(id);
        if (userByID.isPresent()){
            return new ResponseEntity<>(userByID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public List<Sprints> findAllSprintsFromProject(int idProyecto){
        List<Sprints> listaSprints = sprintsRepository.findByIdProyecto(idProyecto);
        return listaSprints;
    }

    public Sprints addSprints(Sprints Sprints){
        return sprintsRepository.save(Sprints);
    }

    public boolean deleteSprints(int id){
        try{
            sprintsRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    
    public Sprints updateSprints(int id, Sprints td){
        Optional<Sprints> SprintsData = sprintsRepository.findById(id);
        if(SprintsData.isPresent()){
            Sprints Sprints = SprintsData.get();
            Sprints.setID(id);
            Sprints.setIdProyecto(td.getIdProyecto());
            Sprints.setNombre(td.getNombre());
            Sprints.setDescripcion(td.getDescripcion());
            Sprints.setFechaInicio(td.getFechaInicio());
            Sprints.setFechaFin(td.getFechaFin());
            Sprints.setCompletado(td.getCompletado());
            Sprints.setDeleted(td.getDeleted());
            return sprintsRepository.save(Sprints);
        }else{
            return null;
        }
    }

}
