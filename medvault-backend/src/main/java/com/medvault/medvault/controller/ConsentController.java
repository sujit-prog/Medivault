package com.medvault.medvault.controller;

import com.medvault.medvault.dto.ConsentResponse;
import com.medvault.medvault.entity.ConsentStatus;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.ConsentService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/consents")
@CrossOrigin(origins = "*")
public class ConsentController {

    @Autowired
    private ConsentService consentService;

    @Autowired
    private UserService userService;

    @PostMapping("/request/{patientId}")
    public ResponseEntity<?> requestConsent(@PathVariable Long patientId, Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            if (!"PROFESSIONAL".equalsIgnoreCase(doctor.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professionals can request consent");
            }

            ConsentResponse response = consentService.requestConsent(doctor, patientId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/patient")
    public ResponseEntity<?> getMyPatientConsents(Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<ConsentResponse> consents = consentService.getPatientConsents(patient);
            return ResponseEntity.ok(consents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/doctor")
    public ResponseEntity<?> getMyDoctorConsents(Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<ConsentResponse> consents = consentService.getDoctorConsents(doctor);
            return ResponseEntity.ok(consents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateConsentStatus(
            @PathVariable Long id,
            @RequestParam("status") String statusStr,
            Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            ConsentStatus status = ConsentStatus.valueOf(statusStr.toUpperCase());
            ConsentResponse response = consentService.updateConsentStatus(id, patient, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid consent status");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
