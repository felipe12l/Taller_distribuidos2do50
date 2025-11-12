package com.example.student_serv.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.example.student_serv.model.Student;
import com.example.student_serv.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;







@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentRepository students;
    @GetMapping("/")
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(students.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable String id) {
        return students.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/")
    public ResponseEntity<Student> create(@Valid @RequestBody Student entity) {
        if (entity.getId() != null && students.existsById(entity.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Student saved = students.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> update(@PathVariable String id, @Valid @RequestBody Student entity) {
        if (!students.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        entity.setId(id);
        Student saved = students.save(entity);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Student> partialUpdate(@PathVariable String id, @RequestBody Student partial) {
        Optional<Student> existingOpt = students.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student existing = existingOpt.get();
        if (partial.getName() != null && !partial.getName().isBlank()) existing.setName(partial.getName());
        if (partial.getEmail() != null && !partial.getEmail().isBlank()) existing.setEmail(partial.getEmail());
        Student saved = students.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!students.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        students.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
