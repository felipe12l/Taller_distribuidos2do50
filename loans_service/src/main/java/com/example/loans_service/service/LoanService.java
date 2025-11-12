package com.example.loans_service.service;

import com.example.loans_service.model.Loan;
import com.example.loans_service.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;

    public List<Loan> findAll() {
        return loanRepository.findAll();
    }

    public Loan findById(String id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));
    }

    public Loan create(Loan loan) {
        loan.setId(null);
        return loanRepository.save(loan);
    }

    public Loan update(String id, Loan loan) {
        Loan existing = findById(id);
        loan.setId(existing.getId());
        return loanRepository.save(loan);
    }

    public void delete(String id) {
        Loan existing = findById(id);
        loanRepository.delete(existing);
    }
}
