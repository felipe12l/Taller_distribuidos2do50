package com.example.classroom.repository;

import com.example.classroom.model.Classroom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DAOclassroom extends MongoRepository<Classroom, String> {

}
