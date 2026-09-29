package com.petrotwin.controller;

import com.petrotwin.service.MlServiceGateway;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wells")
@Tag(name = "Wells & Digital Twin", description = "Endpoints for well states, telemetry, and dynamometer cards")
@CrossOrigin(origins = "*")
public class WellController {

    private final MlServiceGateway mlGateway;

    public WellController(MlServiceGateway mlGateway) {
        this.mlGateway = mlGateway;
    }

    @GetMapping("/{wellId}/state")
    @Operation(summary = "Get Cyber-Physical Digital Twin State")
    public ResponseEntity<Map<String, Object>> getWellState(@PathVariable String wellId) {
        return ResponseEntity.ok(mlGateway.getWellState(wellId));
    }

    @GetMapping("/{wellId}/srp/dyno-card")
    @Operation(summary = "Get Real-Time Surface & Downhole Dynamometer Card")
    public ResponseEntity<Map<String, Object>> getDynamometerCard(@PathVariable String wellId) {
        return ResponseEntity.ok(mlGateway.getDynamometerCard(wellId));
    }
}
