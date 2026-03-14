package com.medvault.medvault.service;

import com.medvault.medvault.entity.ProfessionalProfile;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.ProfessionalProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfessionalService {

    private final ProfessionalProfileRepository professionalProfileRepository;

    public ProfessionalService(ProfessionalProfileRepository professionalProfileRepository) {
        this.professionalProfileRepository = professionalProfileRepository;
    }

    public ProfessionalProfile createProfessionalProfile(
            User user,
            String organizationName,
            String specialization,
            String licenseNumber) {

        // ✅ REMOVED ROLE OVERWRITE
        // user.setRole("PROFESSIONAL");

        ProfessionalProfile profile = new ProfessionalProfile();
        profile.setUser(user);
        profile.setOrganizationName(organizationName);
        profile.setSpecialization(specialization);
        profile.setLicenseNumber(licenseNumber);

        return professionalProfileRepository.save(profile);
    }
}
