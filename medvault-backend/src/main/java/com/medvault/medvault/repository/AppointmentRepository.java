package com.medvault.medvault.repository;

import com.medvault.medvault.entity.Appointment;
import com.medvault.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(User patient);

    List<Appointment> findByDoctor(User doctor);
}
