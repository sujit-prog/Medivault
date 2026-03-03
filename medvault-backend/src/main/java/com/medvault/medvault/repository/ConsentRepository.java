package com.medvault.medvault.repository;

import com.medvault.medvault.entity.Consent;
import com.medvault.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsentRepository extends JpaRepository<Consent, Long> {
    List<Consent> findByDoctor(User doctor);

    List<Consent> findByPatient(User patient);

    boolean existsByDoctorAndPatient(User doctor, User patient);
}
