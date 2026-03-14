package com.medvault.medvault.controller;

import com.medvault.medvault.entity.User;
import com.medvault.medvault.entity.Appointment;
import com.medvault.medvault.repository.AppointmentRepository;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        try {
            List<User> doctorsList = new java.util.ArrayList<>(userService.findAllByRole("DOCTOR"));
            doctorsList.addAll(userService.findAllByRole("PROFESSIONAL"));
            System.out.println("DEBUG: getAllDoctors found: " + doctorsList.size());

            // Map down to safe info
            List<java.util.Map<String, Object>> safeDoctors = doctorsList.stream().map(d -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", d.getId());
                map.put("email", d.getEmail());
                map.put("role", d.getRole());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(safeDoctors);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getMyPatients(Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<Appointment> appointments = appointmentRepository.findByDoctor(doctor);

            // Get unique patients
            Set<User> distinctPatients = appointments.stream()
                    .map(Appointment::getPatient)
                    .collect(Collectors.toSet());

            List<java.util.Map<String, Object>> safePatients = distinctPatients.stream().map(p -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", p.getId());
                map.put("email", p.getEmail());
                map.put("role", p.getRole());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(safePatients);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @Autowired
    private com.medvault.medvault.repository.AvailabilityRepository availabilityRepository;

    @GetMapping("/debug/availability")
    public ResponseEntity<?> debugAvailability() {
        try {
            List<com.medvault.medvault.entity.Availability> allSlots = availabilityRepository.findAll();
            List<java.util.Map<String, Object>> result = allSlots.stream().map(s -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", s.getId());
                map.put("doctorId", s.getDoctor() != null ? s.getDoctor().getId() : null);
                map.put("start", s.getStartTime());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/debug/users")
    public ResponseEntity<?> debugUsers() {
        try {
            List<User> doctorList = new java.util.ArrayList<>(userService.findAllByRole("DOCTOR"));
            doctorList.addAll(userService.findAllByRole("PROFESSIONAL"));
            doctorList.addAll(userService.findAllByRole("PATIENT"));

            List<java.util.Map<String, Object>> result = doctorList.stream().map(u -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", u.getId());
                map.put("email", u.getEmail());
                map.put("role", u.getRole());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
