package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.dto.*;
import com.pheonix.creditappraisalmemo.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    // ── Create Account ────────────────────────────────────────────────────────

    /** POST /auth/register  →  { name, email, password, role } */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // ── Login (direct, no OTP) ────────────────────────────────────────────────

    /** POST /auth/login  →  { email, password } */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ── OTP Login ─────────────────────────────────────────────────────────────

    /**
     * Step 1 — POST /auth/login/send-otp  →  { email, password }
     * Validates credentials; sends OTP to email if correct.
     */
    @PostMapping("/login/send-otp")
    public ResponseEntity<AuthResponse> sendLoginOtp(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.sendLoginOtp(request));
    }

    /**
     * Step 2 — POST /auth/login/verify-otp  →  { email, otp }
     * Checks OTP; returns JWT on success.
     */
    @PostMapping("/login/verify-otp")
    public ResponseEntity<AuthResponse> verifyLoginOtp(@RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyLoginOtp(request));
    }

    // ── Forgot Password ───────────────────────────────────────────────────────

    /**
     * Step 1 — POST /auth/forgot-password/send-otp  →  { email }
     * Sends OTP to the email if an account exists.
     */
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<AuthResponse> sendForgotPasswordOtp(@RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendForgotPasswordOtp(request));
    }

    /**
     * Step 2 — POST /auth/forgot-password/reset  →  { email, otp, newPassword }
     * Validates OTP and resets the password.
     */
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        VerifyOtpRequest otpRequest = new VerifyOtpRequest(request.email(), request.otp());
        return ResponseEntity.ok(authService.verifyOtpAndResetPassword(otpRequest, request.newPassword()));
    }
}
