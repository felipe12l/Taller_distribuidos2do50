package com.example.student_serv.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@ToString
@Document(collection = "students")
public class Student {
    @Id
    private String id;
    @NotBlank
    @Size(min = 2, max = 80)
    private String name;

    @Email
    @NotBlank
    private String email;

    public Student() {
    }

    public Student(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}
