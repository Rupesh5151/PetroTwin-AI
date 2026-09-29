package com.petrotwin.controller;

import com.petrotwin.service.MlServiceGateway;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/optimization")
@Tag(name = "Optimization & Scenario Engine", description = "Joint CSS + SRP Pareto Optimization")
@CrossOrigin(origins = "*")
public class OptimizationController {

    private final MlServiceGateway mlGateway;

    public OptimizationController(MlServiceGateway mlGateway) {
        this.mlGateway = mlGateway;
    }

    @PostMapping("/run")
    @Operation(summary = "Run Constrained Multi-Objective Pareto Optimization")
    public ResponseEntity<Map<String, Object>> runOptimization(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(mlGateway.runOptimization(request));
    }
}
