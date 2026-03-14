package com.medvault.medvault.repository;

import com.medvault.medvault.entity.Availability;
import com.medvault.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByDoctor(User doctor);

    List<Availability> findByDoctorId(Long doctorId);
}