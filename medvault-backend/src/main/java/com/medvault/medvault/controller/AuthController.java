package com.medvault.medvault.controller;

import com.medvault.medvault.dto.LoginRequest;
import com.medvault.medvault.dto.RegisterRequest;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.security.JwtUtil;
import com.medvault.medvault.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PatientService patientService;
    private final ProfessionalService professionalService;

    public AuthController(UserService userService,
            PatientService patientService,
            ProfessionalService professionalService,
            JwtUtil jwtUtil) {
        this.userService = userService;
        this.patientService = patientService;
        this.professionalService = professionalService;
        this.jwtUtil = jwtUtil;
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.authenticate(request.getEmail(), request.getPassword());
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", user.getRole(),
                    "id", user.getId().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = userService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole());

            if (newUser == null) {
                return ResponseEntity.status(400).body(Map.of("message", "User could not be created"));
            }

            String role = request.getRole();
            if (role != null) {
                if (role.equalsIgnoreCase("patient")) {
                    String fName = request.getFirstName() != null ? request.getFirstName() : "";
                    String lName = request.getLastName() != null ? request.getLastName() : "";
                    String fullName = (fName + " " + lName).trim();
                    patientService.createPatientProfile(newUser, fullName.isEmpty() ? null : fullName, null, null);
                } else if (role.equalsIgnoreCase("provider") || role.equalsIgnoreCase("professional")
                        || role.equalsIgnoreCase("doctor")) {
                    professionalService.createProfessionalProfile(newUser, null, null, null);
                }
            }

            String token = jwtUtil.generateToken(newUser.getEmail());
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful",
                    "token", token,
                    "role", newUser.getRole(),
                    "id", newUser.getId().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Step 1 of forgot-password: send OTP to the supplied email.
     * Body: { "email": "user@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }
        try {
            userService.sendPasswordResetOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email address."));
        } catch (Exception e) {
            // Return a generic message to avoid email enumeration
            return ResponseEntity.ok(Map.of("message",
                    "If this email is registered, an OTP has been sent."));
        }
    }

    /**
     * Step 2 of forgot-password: verify OTP and set new password.
     * Body: { "email": "...", "otp": "123456", "newPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (email == null || otp == null || newPassword == null
                || email.isBlank() || otp.isBlank() || newPassword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email, OTP, and new password are required."));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 6 characters."));
        }
        try {
            userService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}