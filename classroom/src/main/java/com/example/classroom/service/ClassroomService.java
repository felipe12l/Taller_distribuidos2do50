package com.example.classroom.service;

import com.example.classroom.model.Classroom;
import com.example.classroom.repository.DAOclassroom;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class ClassroomService {

    private final DAOclassroom repo;

    public ClassroomService(DAOclassroom repo) {
        this.repo = repo;
    }

    public List<Classroom> list() {
        return repo.findAll();
    }

    public Classroom get(String id) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Classroom no encontrado"));
    }

    public Classroom create(Classroom c) {
        // Si viene un id, se respeta; si no, Mongo genera uno
        return repo.save(c);
    }

    public Classroom update(String id, Classroom payload) {
        Classroom current = get(id);
        // Forzamos a usar el id del path
        payload.setId(current.getId());
        return repo.save(payload);
    }

    public void delete(String id) {
        Classroom current = get(id);
        repo.deleteById(current.getId());
    }
}
