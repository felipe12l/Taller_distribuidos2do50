package com.example.loans_service.controller;

import com.example.loans_service.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/top-hour")
    public Map<String, Object> topHour() {
        return metricsService.getTopHour();
    }

    @GetMapping("/classroom-frequency")
    public List<Map<String, Object>> classroomFrequency() {
        return metricsService.getClassroomFrequencies();
    }

}
