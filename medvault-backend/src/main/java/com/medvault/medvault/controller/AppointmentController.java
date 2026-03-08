package com.medvault.medvault.controller;

import com.medvault.medvault.entity.Appointment;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.UserRepository;
import com.medvault.medvault.service.AppointmentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    public AppointmentController(AppointmentService appointmentService,
            UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
    }

    // ✅ BOOK appointment
    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody Appointment request, Authentication authentication) {
        String email = authentication.getName();
        User patient = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return appointmentService.bookAppointment(
                patient,
                request.getDoctor(),
                request.getAppointmentTime());
    }

    // ✅ GET logged-in patient's appointments
    @GetMapping("/patient")
    public List<Appointment> getMyPatientAppointments(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return appointmentService.getPatientAppointments(user);
    }

    // ✅ GET logged-in doctor's appointments
    @GetMapping("/doctor")
    public List<Appointment> getMyDoctorAppointments(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated. Please login.");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return appointmentService.getDoctorAppointments(user);
    }

    // APPROVE
    @PutMapping("/approve/{id}")
    public Appointment approve(@PathVariable Long id) {
        return appointmentService.approveAppointment(id);
    }

    // REJECT
    @PutMapping("/reject/{id}")
    public Appointment reject(@PathVariable Long id) {
        return appointmentService.rejectAppointment(id);
    }

    // FEEDBACK
    @PutMapping("/feedback/{id}")
    public Appointment feedback(@PathVariable Long id,
            @RequestBody String feedback) {
        return appointmentService.addFeedback(id, feedback);
    }
}