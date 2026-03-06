package com.pheonix.creditappraisalmemo.dto;

public record ResetPasswordRequest(String email, String otp, String newPassword) {
}
