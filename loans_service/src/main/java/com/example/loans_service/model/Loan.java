package com.example.loans_service.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@Document(collection = "loans")
public class Loan {
    @Id
    private String id;

    /** Identificador del aula prestada */
    @Indexed
    private String classroomId;

    /** Identificador del estudiante que solicita el préstamo */
    @Indexed
    private String borrowerId;

    /** Estado del préstamo (ej: REQUESTED, APPROVED, FINISHED, CANCELLED) */
    private String status;

    /** Fecha del préstamo (día en que se usa el aula) */
    @Indexed
    private LocalDate loanDate;

    /** Hora inicial (0-23) */
    private Integer startHour;

    /** Hora final (0-23) */
    private Integer endHour;

    public Loan() {}

    public Loan(String id,
                String borrowerId,
                String classroomId,
                String program,
                String status,
                LocalDate loanDate,
                Integer startHour,
                Integer endHour) {
        this.id = id;
        this.borrowerId = borrowerId;
        this.classroomId = classroomId;
        this.status = status;
        this.loanDate = loanDate;
        this.startHour = startHour;
        this.endHour = endHour;
    }
}
