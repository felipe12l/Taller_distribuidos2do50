package com.example.classroom.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@ToString
@Document(collection = "classrooms")
public class Classroom {
    @Id
    private String id;
    @NotBlank(message = "La descripción no puede estar vacía")
    private String description;
    @Min(value = 0, message = "La capacidad debe ser >= 0")
    private int capacity;
    @NotNull(message = "El campo available es obligatorio")
    private Boolean available;

    public Classroom() {
    }

    public Classroom(String id, String description, int capacity, Boolean available) {
        this.id = id;
        this.description = description;
        this.capacity = capacity;
        this.available = available;
    }
}
