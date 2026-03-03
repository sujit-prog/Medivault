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
// Allow both Vite default ports
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
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
            // ✅ Use service
            User user = userService.authenticate(
                    request.getEmail(),
                    request.getPassword());

            String token = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }

    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Use existing createUser service
            User newUser = userService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole());

            // Depending on the role, you could create a Patient or Professional entity here
            // using patientService or professionalService.
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
                    "token", token));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                    "message", e.getMessage()));
        }
    }
}