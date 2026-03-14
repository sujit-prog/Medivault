package com.medvault.medvault.controller;

import com.medvault.medvault.entity.Appointment;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.UserRepository;
import com.medvault.medvault.service.AppointmentService;
import com.medvault.medvault.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AppointmentController(AppointmentService appointmentService,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public static class AppointmentRequest {
        private DoctorInfo doctor;
        private java.time.LocalDateTime appointmentTime;
        private Long availabilityId;

        public DoctorInfo getDoctor() {
            return doctor;
        }

        public void setDoctor(DoctorInfo doctor) {
            this.doctor = doctor;
        }

        public java.time.LocalDateTime getAppointmentTime() {
            return appointmentTime;
        }

        public void setAppointmentTime(java.time.LocalDateTime appointmentTime) {
            this.appointmentTime = appointmentTime;
        }

        public Long getAvailabilityId() {
            return availabilityId;
        }

        public void setAvailabilityId(Long availabilityId) {
            this.availabilityId = availabilityId;
        }

        public static class DoctorInfo {
            private Long id;

            public Long getId() {
                return id;
            }

            public void setId(Long id) {
                this.id = id;
            }
        }
    }

    // ✅ BOOK appointment
    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody AppointmentRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User patient = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getDoctor() == null || request.getDoctor().getId() == null) {
            throw new RuntimeException("Doctor ID is required");
        }

        Long doctorId = request.getDoctor().getId();

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        java.time.LocalDateTime appointmentTime = request.getAppointmentTime();
        Long availabilityId = request.getAvailabilityId();

        Appointment saved = appointmentService.bookAppointment(
                patient,
                doctor,
                appointmentTime,
                availabilityId);

        // Notify doctor of new request
        String time = appointmentTime != null ? appointmentTime.toString().replace("T", " ").substring(0, 16)
                : "unknown time";
        notificationService.createNotification(doctor,
                "📅 New appointment request from " + patient.getEmail() + " for " + time
                        + ". Please approve or reject.");

        return saved;
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
        Appointment appt = appointmentService.approveAppointment(id);
        notificationService.createNotification(appt.getPatient(),
                "✅ Your appointment on " + appt.getAppointmentTime().toString().replace("T", " ").substring(0, 16)
                        + " has been approved by your doctor!");
        return appt;
    }

    // REJECT
    @PutMapping("/reject/{id}")
    public Appointment reject(@PathVariable Long id) {
        Appointment appt = appointmentService.rejectAppointment(id);
        notificationService.createNotification(appt.getPatient(),
                "❌ Your appointment request has been declined. Please book another available slot.");
        return appt;
    }

    // FEEDBACK
    @PutMapping("/feedback/{id}")
    public Appointment feedback(@PathVariable Long id,
            @RequestBody java.util.Map<String, Object> body) {
        String feedbackText = (String) body.get("feedback");
        Integer rating = body.get("rating") != null ? ((Number) body.get("rating")).intValue() : null;
        return appointmentService.addFeedback(id, feedbackText, rating);
    }
}