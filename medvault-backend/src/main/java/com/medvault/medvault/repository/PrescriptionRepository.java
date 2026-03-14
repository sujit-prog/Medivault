package com.medvault.medvault.repository;

import com.medvault.medvault.entity.Prescription;
import com.medvault.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientOrderByCreatedAtDesc(User patient);

    List<Prescription> findByDoctorOrderByCreatedAtDesc(User doctor);
}
