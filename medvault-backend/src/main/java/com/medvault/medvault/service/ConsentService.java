package com.medvault.medvault.service;

import com.medvault.medvault.dto.ConsentResponse;
import com.medvault.medvault.entity.Consent;
import com.medvault.medvault.entity.ConsentStatus;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.ConsentRepository;
import com.medvault.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsentService {

    @Autowired
    private ConsentRepository consentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public ConsentResponse requestConsent(User doctor, Long patientId) throws Exception {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new Exception("Patient not found"));

        if (!"PATIENT".equalsIgnoreCase(patient.getRole())) {
            throw new Exception("Requested user is not a patient");
        }

        if (consentRepository.existsByDoctorAndPatient(doctor, patient)) {
            // Already requested or exists
            throw new Exception("Consent request already exists for this patient");
        }

        Consent consent = new Consent();
        consent.setDoctor(doctor);
        consent.setPatient(patient);
        Consent savedConsent = consentRepository.save(consent);

        notificationService.createNotification(patient,
                "Doctor " + doctor.getEmail() + " has requested access to your medical records.");

        return mapToResponse(savedConsent);
    }

    public List<ConsentResponse> getPatientConsents(User patient) {
        return consentRepository.findByPatient(patient)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ConsentResponse> getDoctorConsents(User doctor) {
        return consentRepository.findByDoctor(doctor)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ConsentResponse updateConsentStatus(Long consentId, User patient, ConsentStatus status) throws Exception {
        Consent consent = consentRepository.findById(consentId)
                .orElseThrow(() -> new Exception("Consent not found"));

        if (!consent.getPatient().getId().equals(patient.getId())) {
            throw new Exception("Unauthorized to modify this consent");
        }

        consent.setStatus(status);
        consent.setUpdatedAt(LocalDateTime.now());
        Consent updatedConsent = consentRepository.save(consent);

        notificationService.createNotification(consent.getDoctor(),
                "Patient " + patient.getEmail() + " has " + status.name().toLowerCase() + " your consent request.");

        return mapToResponse(updatedConsent);
    }

    public boolean hasConsent(User doctor, User patient) {
        List<Consent> consents = consentRepository.findByDoctor(doctor);
        for (Consent c : consents) {
            if (c.getPatient().getId().equals(patient.getId()) && c.getStatus() == ConsentStatus.APPROVED) {
                return true;
            }
        }
        return false;
    }

    private ConsentResponse mapToResponse(Consent consent) {
        ConsentResponse res = new ConsentResponse();
        res.setId(consent.getId());
        res.setDoctorId(consent.getDoctor().getId());
        res.setDoctorName(consent.getDoctor().getEmail()); // Or proper name
        res.setPatientId(consent.getPatient().getId());
        res.setPatientName(consent.getPatient().getEmail());
        res.setStatus(consent.getStatus());
        res.setRequestedAt(consent.getRequestedAt());
        res.setUpdatedAt(consent.getUpdatedAt());
        return res;
    }
}
