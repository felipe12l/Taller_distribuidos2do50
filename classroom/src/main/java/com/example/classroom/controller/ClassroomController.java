package com.example.classroom.controller;

import com.example.classroom.model.Classroom;
import com.example.classroom.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService service;

    @GetMapping
    public List<Classroom> getAll() {
        return service.list();
    }

    @GetMapping("/{id}")
    public Classroom getById(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<Classroom> create(@Valid @RequestBody Classroom body) {
        Classroom saved = service.create(body);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public Classroom update(@PathVariable String id, @Valid @RequestBody Classroom body) {
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
