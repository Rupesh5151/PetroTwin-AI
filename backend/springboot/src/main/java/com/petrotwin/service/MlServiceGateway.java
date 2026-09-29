package com.petrotwin.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class MlServiceGateway {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlServiceGateway(RestTemplateBuilder builder,
                            @Value("${petrotwin.ml-service.url:http://localhost:8000}") String mlServiceUrl) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(6))
                .build();
        this.mlServiceUrl = mlServiceUrl;
    }

    public Map<String, Object> getWellState(String wellId) {
        try {
            return restTemplate.getForObject(mlServiceUrl + "/api/wells/" + wellId + "/state", Map.class);
        } catch (Exception e) {
            return getFallbackState(wellId);
        }
    }

    public Map<String, Object> getDynamometerCard(String wellId) {
        try {
            return restTemplate.getForObject(mlServiceUrl + "/api/wells/" + wellId + "/srp/dyno-card", Map.class);
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("well_id", wellId);
            fallback.put("status", "FALLBACK_MODE");
            return fallback;
        }
    }

    public Map<String, Object> runOptimization(Map<String, Object> request) {
        try {
            return restTemplate.postForObject(mlServiceUrl + "/optimize", request, Map.class);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "FAILED_OR_FALLBACK");
            err.put("message", "ML service optimization endpoint unavailable: " + e.getMessage());
            return err;
        }
    }

    public Map<String, Object> queryCopilot(String query, String wellId) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("query", query);
            payload.put("well_id", wellId);
            return restTemplate.postForObject(mlServiceUrl + "/api/copilot/query", payload, Map.class);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("answer", "Copilot agent temporarily in offline fallback mode. Error: " + e.getMessage());
            return err;
        }
    }

    private Map<String, Object> getFallbackState(String wellId) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("well_id", wellId);
        fallback.put("data_source_mode", "FALLBACK_OFFLINE");
        fallback.put("scientific_honesty_disclaimer", "SIMULATED / SYNTHETIC - NOT OIL INDIA FIELD DATA");
        return fallback;
    }
}
