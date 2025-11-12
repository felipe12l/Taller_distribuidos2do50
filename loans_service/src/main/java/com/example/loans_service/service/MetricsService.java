package com.example.loans_service.service;

import com.example.loans_service.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final LoanRepository loanRepository;

    public Map<String, Object> getTopHour() {
        return loanRepository.findTopHour()
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("hour", p.get_id());
                    m.put("count", p.getCount());
                    return m;
                })
                .orElseGet(() -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("hour", null);
                    m.put("count", 0);
                    return m;
                });
    }

    public List<Map<String, Object>> getClassroomFrequencies() {
        return loanRepository.findClassroomFrequencies().stream()
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("classroomId", p.get_id());
                    m.put("count", p.getCount());
                    return m;
                })
                .toList();
    }

}
