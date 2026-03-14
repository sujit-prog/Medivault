package com.medvault.medvault.controller;

import com.medvault.medvault.entity.PatientProfile;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.ProfileService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    /** GET own profile */
    @GetMapping
    public ResponseEntity<?> getMyProfile(Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            String role = user.getRole() == null ? "" : user.getRole().toUpperCase();
            if ("PATIENT".equals(role)) {
                return ResponseEntity.ok(profileService.getOrCreatePatientProfile(user));
            } else {
                return ResponseEntity.ok(profileService.getOrCreateProfessionalProfile(user));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** PUT update own profile */
    @PutMapping
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, String> data, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            String role = user.getRole() == null ? "" : user.getRole().toUpperCase();
            if ("PATIENT".equals(role)) {
                return ResponseEntity.ok(profileService.updatePatientProfile(user, data));
            } else {
                return ResponseEntity.ok(profileService.updateProfessionalProfile(user, data));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * GET patient profile by userId (doctors only, requires appointment
     * relationship)
     */
    @GetMapping("/patient/{userId}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long userId, Principal principal) {
        try {
            User requester = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));
            PatientProfile profile = profileService.getPatientProfileById(requester, userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
