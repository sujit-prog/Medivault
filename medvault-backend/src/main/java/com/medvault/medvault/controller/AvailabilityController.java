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
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private UserService userService;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/add")
    public ResponseEntity<?> addSlot(@RequestBody Map<String, String> request, Principal principal) {
        System.out.println("DEBUG: AvailabilityController - addSlot called by: "
                + (principal != null ? principal.getName() : "null"));
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            String role = doctor.getRole();
            System.out.println("DEBUG: AvailabilityController - User role: " + role);
            if (!"DOCTOR".equalsIgnoreCase(role) && !"PROFESSIONAL".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only doctors can add availability");
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
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<Availability> slots = availabilityService.getDoctorAvailability(doctor);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @Autowired
    private com.medvault.medvault.repository.AvailabilityRepository availabilityRepository;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAvailabilityForDoctor(@PathVariable Long doctorId) {
        System.out.println("DEBUG: getAvailabilityForDoctor called for ID: " + doctorId);
        try {
            List<Availability> slots = availabilityRepository.findByDoctorId(doctorId);
            System.out.println("DEBUG: getAvailabilityForDoctor ID: " + doctorId + " - Slots found: " + slots.size());

            List<java.util.Map<String, Object>> safeSlots = slots.stream().map(s -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", s.getId());
                map.put("startTime", s.getStartTime() != null ? s.getStartTime().toString() : null);
                map.put("endTime", s.getEndTime() != null ? s.getEndTime().toString() : null);
                return map;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(safeSlots);
        } catch (Exception e) {
            System.out.println("DEBUG: Error in getAvailabilityForDoctor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
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
