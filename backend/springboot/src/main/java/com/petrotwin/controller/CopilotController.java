package com.petrotwin.controller;

import com.petrotwin.service.MlServiceGateway;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/copilot")
@Tag(name = "Agentic AI Copilot", description = "Deterministic tool supervisor and reasoning assistant")
@CrossOrigin(origins = "*")
public class CopilotController {

    private final MlServiceGateway mlGateway;

    public CopilotController(MlServiceGateway mlGateway) {
        this.mlGateway = mlGateway;
    }

    @PostMapping("/query")
    @Operation(summary = "Submit an engineering query to the Agentic Supervisor")
    public ResponseEntity<Map<String, Object>> queryCopilot(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("query", "Summarize well state");
        String wellId = request.getOrDefault("well_id", "BW-DEMO-001");
        return ResponseEntity.ok(mlGateway.queryCopilot(query, wellId));
    }
}
