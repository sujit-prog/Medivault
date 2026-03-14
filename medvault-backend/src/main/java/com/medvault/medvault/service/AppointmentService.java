package com.medvault.medvault.service;

import com.medvault.medvault.entity.Appointment;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.AppointmentRepository;
import com.medvault.medvault.repository.AvailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
            AvailabilityRepository availabilityRepository) {
        this.appointmentRepository = appointmentRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public Appointment bookAppointment(User patient, User doctor, LocalDateTime time, Long availabilityId) {
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(time);
        appointment.setStatus("PENDING");

        if (availabilityId != null) {
            availabilityRepository.findById(availabilityId).ifPresent(availabilityRepository::delete);
        }

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getPatientAppointments(User patient) {
        return appointmentRepository.findByPatient(patient);
    }

    public List<Appointment> getDoctorAppointments(User doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }

    public Appointment approveAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("APPROVED");
        return appointmentRepository.save(appt);
    }

    public Appointment rejectAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("REJECTED");
        return appointmentRepository.save(appt);
    }

    public Appointment addFeedback(Long id, String feedback, Integer rating) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setFeedback(feedback);
        if (rating != null)
            appt.setRating(rating);
        return appointmentRepository.save(appt);
    }
}