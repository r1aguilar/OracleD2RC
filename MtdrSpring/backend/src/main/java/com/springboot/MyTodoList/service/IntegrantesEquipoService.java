package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.IntegrantesEquipo;
import com.springboot.MyTodoList.repository.IntegrantesEquipoRepository;

@Service
public class IntegrantesEquipoService {

    @Autowired
    private IntegrantesEquipoRepository integrantesEquipoRepository;
    public List<IntegrantesEquipo> findAll(){
        List<IntegrantesEquipo> Equipos = integrantesEquipoRepository.findAll();
        return Equipos;
    }

    public List<IntegrantesEquipo> findAllByIdEquipo(int idEquipo){
        List<IntegrantesEquipo> integrantesEquipos = integrantesEquipoRepository.findAllByIdEquipo(idEquipo);
        return integrantesEquipos;
    }

    public ResponseEntity<IntegrantesEquipo> getItemByIdUsuario(int id){
        Optional<IntegrantesEquipo> userByID = integrantesEquipoRepository.findById(id);
        if (userByID.isPresent()){
            return new ResponseEntity<>(userByID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public IntegrantesEquipo addEquipo(IntegrantesEquipo Equipo){
        return integrantesEquipoRepository.save(Equipo);
    }

    public boolean deleteEquipo(int id){
        try{
            integrantesEquipoRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    
    public IntegrantesEquipo updateEquipo(int id, IntegrantesEquipo td){
        Optional<IntegrantesEquipo> integrantesEquipoData = integrantesEquipoRepository.findById(id);
        if(integrantesEquipoData.isPresent()){
            IntegrantesEquipo integrantesEquipo = integrantesEquipoData.get();
            integrantesEquipo.setIdEquipo(td.getIdEquipo());
            integrantesEquipo.setIdUsuario(td.getIdUsuario());
            integrantesEquipo.setIdRol(td.getIdRol());
            return integrantesEquipoRepository.save(integrantesEquipo);
        }else{
            return null;
        }
    }

}