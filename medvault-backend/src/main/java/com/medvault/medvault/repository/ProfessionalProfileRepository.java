package com.medvault.medvault.repository;

import com.medvault.medvault.entity.ProfessionalProfile;
import com.medvault.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, Long> {

    Optional<ProfessionalProfile> findByUser(User user);
}
