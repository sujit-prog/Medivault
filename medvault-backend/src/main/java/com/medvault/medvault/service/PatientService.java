package com.medvault.medvault.service;

import com.medvault.medvault.entity.PatientProfile;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.PatientProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;

    public PatientService(PatientProfileRepository patientProfileRepository) {
        this.patientProfileRepository = patientProfileRepository;
    }

    public PatientProfile createPatientProfile(
            User user,
            String fullName,
            String phone,
            String gender
    ) {

        // ✅ SET ROLE HERE (inside method)
        user.setRole("PATIENT");

        PatientProfile profile = new PatientProfile();
        profile.setUser(user);
        profile.setFullName(fullName);
        profile.setPhone(phone);
        profile.setGender(gender);

        return patientProfileRepository.save(profile);
    }
}
