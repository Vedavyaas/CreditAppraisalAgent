package com.pheonix.creditappraisalmemo.dto;

public record AuthResponse(
    String token, 
    String message,
    Long userId,
    String email,
    String name,
    String role
) {
    public AuthResponse(String token, String message) {
        this(token, message, null, null, null, null);
    }
}
