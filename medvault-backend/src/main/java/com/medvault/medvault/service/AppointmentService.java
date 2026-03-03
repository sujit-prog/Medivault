package com.medvault.medvault.service;

import com.medvault.medvault.entity.Appointment;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment bookAppointment(User patient, User doctor, LocalDateTime time) {
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(time);
        appointment.setStatus("BOOKED");

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

    public Appointment addFeedback(Long id, String feedback) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setFeedback(feedback);
        return appointmentRepository.save(appt);
    }
}