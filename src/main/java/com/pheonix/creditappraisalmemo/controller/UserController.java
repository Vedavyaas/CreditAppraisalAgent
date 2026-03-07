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
    /**
     * Step 2 — POST /auth/forgot-password/reset  →  { email, otp, newPassword }
     * Validates OTP and resets the password.
     */
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        VerifyOtpRequest otpRequest = new VerifyOtpRequest(request.email(), request.otp());
        return ResponseEntity.ok(authService.verifyOtpAndResetPassword(otpRequest, request.newPassword()));
    }

    // ── Admin Endpoints ───────────────────────────────────────────────────────

    /**
     * GET /auth/users
     * Returns a list of all registered users. Only accessible by ADMIN.
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.pheonix.creditappraisalmemo.repository.UserDetailsEntity>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    /**
     * PUT /auth/users/{userId}/suspend
     * Toggles the suspension status of a user. Accessible by ADMIN.
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<com.pheonix.creditappraisalmemo.repository.UserDetailsEntity> toggleUserSuspension(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.toggleUserSuspension(userId));
    }

    /**
     * DELETE /auth/users/{userId}
     * Deletes a user permanently. Accessible by ADMIN.
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        authService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /auth/users/{userId}/role?role=NEW_ROLE
     * Changes the role of a specific user.
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<com.pheonix.creditappraisalmemo.repository.UserDetailsEntity> changeUserRole(
            @PathVariable Long userId, 
            @RequestParam com.pheonix.creditappraisalmemo.assets.Role role) {
        return ResponseEntity.ok(authService.changeUserRole(userId, role));
    }

    public record InviteUserRequest(String name, String email, com.pheonix.creditappraisalmemo.assets.Role role) {}

    /**
     * POST /auth/users/invite
     * Creates a new user with a default password from the Admin panel.
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/invite")
    public ResponseEntity<com.pheonix.creditappraisalmemo.repository.UserDetailsEntity> inviteUser(
            @RequestBody InviteUserRequest request) {
        return ResponseEntity.ok(authService.inviteUser(request.name(), request.email(), request.role()));
    }
}
