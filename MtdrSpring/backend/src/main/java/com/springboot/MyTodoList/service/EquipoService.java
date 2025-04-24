package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Equipo;
import com.springboot.MyTodoList.repository.EquipoRepository;

@Service
public class EquipoService {

    @Autowired
    private EquipoRepository equipoRepository;
    public List<Equipo> findAll(){
        List<Equipo> Equipos = equipoRepository.findAll();
        return Equipos;
    }


    public ResponseEntity<Equipo> getItemById(int id){
        Optional<Equipo> userByID = equipoRepository.findById(id);
        if (userByID.isPresent()){
            return new ResponseEntity<>(userByID.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<Equipo> findEquipoByIdProyecto(int idProyecto){
        Optional<Equipo> equipo  = equipoRepository.findByIdProyecto(idProyecto);
        if (equipo.isPresent()){
            return new ResponseEntity<>(equipo.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Equipo addEquipo(Equipo Equipo){
        return equipoRepository.save(Equipo);
    }

    public boolean deleteEquipo(int id){
        try{
            equipoRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    
    public Equipo updateEquipo(int id, Equipo td){
        Optional<Equipo> EquipoData = equipoRepository.findById(id);
        if(EquipoData.isPresent()){
            Equipo Equipo = EquipoData.get();
            Equipo.setIdEquipo(td.getIdEquipo());
            Equipo.setIdProyecto(td.getIdProyecto());
            Equipo.setNombreEquipo(td.getNombreEquipo());
            Equipo.setDescripcionEquipo(td.getDescripcionEquipo());
            Equipo.setNumIntegrantes(td.getNumIntegrantes());
            Equipo.setDeleted(td.getDeleted());
            return equipoRepository.save(Equipo);
        }else{
            return null;
        }
    }

}