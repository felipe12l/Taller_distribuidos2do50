package com.example.loans_service.repository;

import com.example.loans_service.model.Loan;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends MongoRepository<Loan, String> {

    /** Hora con mayor frecuencia de préstamos (se toma startHour). */
    @Aggregation(pipeline = {
	    "{ $match: { startHour: { $ne: null } } }",
	    "{ $group: { _id: '$startHour', count: { $sum: 1 } } }",
	    "{ $sort: { count: -1 } }",
	    "{ $limit: 1 }"
    })
    Optional<HourCountProjection> findTopHour();

    /** Frecuencia de préstamo por aula */
    @Aggregation(pipeline = {
	    "{ $group: { _id: '$classroomId', count: { $sum: 1 } } }",
	    "{ $sort: { count: -1 } }"
    })
    List<ClassroomCountProjection> findClassroomFrequencies();

    interface HourCountProjection { Integer get_id(); Integer getCount(); }
    interface ClassroomCountProjection { String get_id(); Integer getCount(); }
}
