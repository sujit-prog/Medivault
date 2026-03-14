package com.medvault.medvault.service;

import com.medvault.medvault.dto.PrescriptionResponse;
import com.medvault.medvault.entity.Prescription;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.PrescriptionRepository;
import com.medvault.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Doctor creates a prescription for a patient.
     * Either medicines text, an image, or both must be provided.
     */
    public PrescriptionResponse createPrescription(
            User doctor,
            Long patientId,
            String medicines,
            String notes,
            MultipartFile image) throws Exception {

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new Exception("Patient not found with id: " + patientId));

        if ((medicines == null || medicines.isBlank()) && (image == null || image.isEmpty())) {
            throw new Exception("Either medicines text or an image must be provided.");
        }

        Prescription prescription = new Prescription();
        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setMedicines(medicines);
        prescription.setNotes(notes);

        if (image != null && !image.isEmpty()) {
            try {
                prescription.setImageData(image.getBytes());
                prescription.setImageName(image.getOriginalFilename());
                prescription.setImageContentType(image.getContentType() != null
                        ? image.getContentType()
                        : "application/octet-stream");
            } catch (IOException e) {
                throw new Exception("Failed to read image file: " + e.getMessage());
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);
        return mapToResponse(saved);
    }

    /** Patient retrieves all prescriptions written for them. */
    public List<PrescriptionResponse> getPrescriptionsForPatient(User patient) {
        return prescriptionRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Doctor retrieves all prescriptions they have sent. */
    public List<PrescriptionResponse> getPrescriptionsForDoctor(User doctor) {
        return prescriptionRepository.findByDoctorOrderByCreatedAtDesc(doctor)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Returns the raw entity for image streaming. */
    public Prescription getPrescriptionEntity(Long id) throws Exception {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new Exception("Prescription not found with id: " + id));
    }

    private PrescriptionResponse mapToResponse(Prescription p) {
        PrescriptionResponse res = new PrescriptionResponse();
        res.setId(p.getId());
        res.setDoctorId(p.getDoctor().getId());
        res.setDoctorEmail(p.getDoctor().getEmail());
        res.setPatientId(p.getPatient().getId());
        res.setPatientEmail(p.getPatient().getEmail());
        res.setMedicines(p.getMedicines());
        res.setNotes(p.getNotes());
        res.setCreatedAt(p.getCreatedAt());
        res.setImageName(p.getImageName());
        // Only expose image URL if an image was actually stored
        if (p.getImageData() != null && p.getImageData().length > 0) {
            res.setImageUrl("/api/prescriptions/" + p.getId() + "/image");
        }
        return res;
    }
}
