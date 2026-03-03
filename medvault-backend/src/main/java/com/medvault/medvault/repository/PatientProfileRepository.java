package com.medvault.medvault.repository;

import com.medvault.medvault.entity.PatientProfile;
import com.medvault.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {

    Optional<PatientProfile> findByUser(User user);
}
