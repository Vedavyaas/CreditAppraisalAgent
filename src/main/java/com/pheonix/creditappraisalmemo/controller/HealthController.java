package com.pheonix.creditappraisalmemo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
public class HealthController {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @GetMapping("/")
    public void root(HttpServletResponse response) throws IOException {
        response.sendRedirect(frontendUrl);
    }

    @GetMapping("/api/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
