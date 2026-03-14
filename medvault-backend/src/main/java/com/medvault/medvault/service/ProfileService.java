package com.medvault.medvault.service;

import com.medvault.medvault.entity.ConsentStatus;
import com.medvault.medvault.entity.PatientProfile;
import com.medvault.medvault.entity.ProfessionalProfile;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.ConsentRepository;
import com.medvault.medvault.repository.PatientProfileRepository;
import com.medvault.medvault.repository.ProfessionalProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class ProfileService {

    private final PatientProfileRepository patientProfileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ConsentRepository consentRepository;

    public ProfileService(PatientProfileRepository patientProfileRepository,
            ProfessionalProfileRepository professionalProfileRepository,
            ConsentRepository consentRepository) {
        this.patientProfileRepository = patientProfileRepository;
        this.professionalProfileRepository = professionalProfileRepository;
        this.consentRepository = consentRepository;
    }

    // ---- PATIENT PROFILE ----

    public PatientProfile getOrCreatePatientProfile(User user) {
        return patientProfileRepository.findByUser(user).orElseGet(() -> {
            PatientProfile p = new PatientProfile();
            p.setUser(user);
            return patientProfileRepository.save(p);
        });
    }

    public PatientProfile updatePatientProfile(User user, Map<String, String> data) {
        PatientProfile profile = getOrCreatePatientProfile(user);
        if (data.containsKey("fullName"))
            profile.setFullName(data.get("fullName"));
        if (data.containsKey("gender"))
            profile.setGender(data.get("gender"));
        if (data.containsKey("phone"))
            profile.setPhone(data.get("phone"));
        if (data.containsKey("bloodGroup"))
            profile.setBloodGroup(data.get("bloodGroup"));
        if (data.containsKey("address"))
            profile.setAddress(data.get("address"));
        if (data.containsKey("dob") && data.get("dob") != null && !data.get("dob").isBlank()) {
            profile.setDob(LocalDate.parse(data.get("dob")));
        }
        return patientProfileRepository.save(profile);
    }

    /**
     * Doctors/Professionals may only view a patient profile if patient has granted
     * APPROVED consent.
     */
    public PatientProfile getPatientProfileById(User requester, Long patientUserId) throws Exception {
        String role = requester.getRole() == null ? "" : requester.getRole().toUpperCase();
        if ("PROFESSIONAL".equals(role) || "DOCTOR".equals(role)) {
            // Find the patient user object from the profile repository
            PatientProfile target = patientProfileRepository.findAll().stream()
                    .filter(p -> p.getUser().getId().equals(patientUserId))
                    .findFirst()
                    .orElseThrow(() -> new Exception("Patient profile not found"));

            boolean hasConsent = consentRepository.findByDoctor(requester).stream()
                    .anyMatch(c -> c.getPatient().getId().equals(patientUserId)
                            && c.getStatus() == ConsentStatus.APPROVED);
            if (!hasConsent) {
                throw new Exception("Access denied: patient has not granted consent.");
            }
            return target;
        }
        // Patients can only view their own profile via this endpoint
        return patientProfileRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(patientUserId))
                .findFirst()
                .orElseThrow(() -> new Exception("Patient profile not found"));
    }

    // ---- PROFESSIONAL PROFILE ----

    public ProfessionalProfile getOrCreateProfessionalProfile(User user) {
        return professionalProfileRepository.findByUser(user).orElseGet(() -> {
            ProfessionalProfile p = new ProfessionalProfile();
            p.setUser(user);
            return professionalProfileRepository.save(p);
        });
    }

    public ProfessionalProfile updateProfessionalProfile(User user, Map<String, String> data) {
        ProfessionalProfile profile = getOrCreateProfessionalProfile(user);
        if (data.containsKey("organizationName"))
            profile.setOrganizationName(data.get("organizationName"));
        if (data.containsKey("specialization"))
            profile.setSpecialization(data.get("specialization"));
        if (data.containsKey("licenseNumber"))
            profile.setLicenseNumber(data.get("licenseNumber"));
        if (data.containsKey("phone"))
            profile.setPhone(data.get("phone"));
        if (data.containsKey("address"))
            profile.setAddress(data.get("address"));
        return professionalProfileRepository.save(profile);
    }
}
