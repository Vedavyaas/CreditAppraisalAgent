package com.pheonix.creditappraisalmemo.service;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.assets.Role;
import com.pheonix.creditappraisalmemo.dto.*;
import com.pheonix.creditappraisalmemo.repository.UserDetailsEntity;
import com.pheonix.creditappraisalmemo.repository.UserDetailsRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    private final UserDetailsRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final OtpService otpService;

    public AuthService(UserDetailsRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtEncoder jwtEncoder,
                       OtpService otpService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.otpService = otpService;
    }

    @AuditAction("New user account registration")
    public AuthResponse register(RegisterRequest request) {
        if (userRepo.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        Role role = request.role() != null ? request.role() : Role.VIEWER;
        UserDetailsEntity user = new UserDetailsEntity(
                request.name(), request.email(), passwordEncoder.encode(request.password()), role);
        userRepo.save(user);
        return new AuthResponse(
            mintToken(user.getEmail(), role.name()), 
            "Account created successfully.",
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name()
        );
    }

    @AuditAction("System login attempt")
    public AuthResponse login(LoginRequest request) {
        log.info("AUTH DEBUG: Attempting login for email: {}", request.email());
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
            
            UserDetailsEntity user = userRepo.findByEmail(request.email())
                    .orElseThrow(() -> new RuntimeException("User not found after successful authentication."));
            
            log.info("AUTH DEBUG: Login successful for: {}", request.email());
            return new AuthResponse(
                mintToken(auth.getName(), user.getRole().name()), 
                "Login successful.",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name()
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("AUTH DEBUG: Authentication FAILED for email {}: {}", request.email(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("AUTH DEBUG: Unexpected error during login for email {}: {}", request.email(), e.getMessage(), e);
            throw e;
        }
    }
    public AuthResponse sendLoginOtp(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        otpService.generateAndSend(request.email());
        return new AuthResponse(null, "OTP sent to " + request.email() + ". Please verify to complete login.");
    }

    @AuditAction("MFA/OTP verification for login")
    public AuthResponse verifyLoginOtp(VerifyOtpRequest request) {
        if (!otpService.validate(request.email(), request.otp())) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }
        UserDetailsEntity user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found."));
        return new AuthResponse(
            mintToken(user.getEmail(), user.getRole().name()), 
            "OTP verified. Login successful.",
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name()
        );
    }

    public AuthResponse sendForgotPasswordOtp(SendOtpRequest request) {
        userRepo.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email."));
        otpService.generateAndSend(request.email());
        return new AuthResponse(null, "OTP sent to " + request.email() + ". Use it to reset your password.");
    }

    public AuthResponse verifyOtpAndResetPassword(VerifyOtpRequest otpRequest, String newPassword) {
        if (!otpService.validate(otpRequest.email(), otpRequest.otp())) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }
        UserDetailsEntity user = userRepo.findByEmail(otpRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found."));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        return new AuthResponse(null, "Password reset successfully. Please log in.");
    }

    private String mintToken(String subject, String role) {
        Instant now = Instant.now();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("CreditAppraisalMemo")
                .issuedAt(now)
                .expiresAt(now.plus(8, ChronoUnit.HOURS))
                .subject(subject)
                .claim("role", role)
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public java.util.List<UserDetailsEntity> getAllUsers() {
        return userRepo.findAll();
    }

    public UserDetailsEntity toggleUserSuspension(Long userId) {
        UserDetailsEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent admin from suspending themselves
        if (user.getRole() == com.pheonix.creditappraisalmemo.assets.Role.ADMIN) {
            throw new RuntimeException("Cannot suspend an administrator account");
        }
        user.setSuspended(!user.isSuspended());
        return userRepo.save(user);
    }

    public void deleteUser(Long userId) {
        UserDetailsEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent admin from deleting themselves
        if (user.getRole() == com.pheonix.creditappraisalmemo.assets.Role.ADMIN) {
            throw new RuntimeException("Cannot delete an administrator account");
        }
        userRepo.delete(user);
    }

    public UserDetailsEntity changeUserRole(Long userId, com.pheonix.creditappraisalmemo.assets.Role newRole) {
        UserDetailsEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent changing admin's own role to avoid lockout
        if (user.getRole() == com.pheonix.creditappraisalmemo.assets.Role.ADMIN) {
            throw new RuntimeException("Cannot modify the role of an administrator account");
        }
        
        user.setRole(newRole);
        return userRepo.save(user);
    }

    public UserDetailsEntity inviteUser(String name, String email, com.pheonix.creditappraisalmemo.assets.Role role) {
        if (userRepo.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }
        
        UserDetailsEntity newUser = new UserDetailsEntity();
        newUser.setName(name);
        newUser.setEmail(email);
        // Default password for invited users
        newUser.setPassword(passwordEncoder.encode("password"));
        newUser.setRole(role);
        
        return userRepo.save(newUser);
    }
}
