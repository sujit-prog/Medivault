package com.medvault.medvault.controller;

import com.medvault.medvault.entity.Availability;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.AvailabilityService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<?> addSlot(@RequestBody Map<String, String> request, Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            if (!"PROFESSIONAL".equalsIgnoreCase(doctor.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professionals can add availability");
            }

            LocalDateTime start = LocalDateTime.parse(request.get("startTime"));
            LocalDateTime end = LocalDateTime.parse(request.get("endTime"));

            Availability slot = availabilityService.addSlot(doctor, start, end);
            return ResponseEntity.ok(slot);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAvailability(Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<Availability> slots = availabilityService.getDoctorAvailability(doctor);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id, Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            availabilityService.deleteSlot(id, doctor);
            return ResponseEntity.ok("Slot deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
