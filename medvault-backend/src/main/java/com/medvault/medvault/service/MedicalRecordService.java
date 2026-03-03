package com.medvault.medvault.service;

import com.medvault.medvault.dto.MedicalRecordResponse;
import com.medvault.medvault.entity.MedicalRecord;
import com.medvault.medvault.entity.RecordCategory;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    private final String uploadDir = "uploads/";

    public MedicalRecordResponse uploadRecord(User patient, MultipartFile file, String title, RecordCategory category)
            throws IOException {
        // Create uploads directory if it doesn't exist
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Generate a unique file name
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filepath = Paths.get(uploadDir, fileName);

        // Save the file locally
        Files.write(filepath, file.getBytes());

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setTitle(title);
        record.setCategory(category);
        record.setFilePath(filepath.toString());
        record.setAuditTrail("Record uploaded.");

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        return mapToResponse(savedRecord);
    }

    public List<MedicalRecordResponse> getPatientRecords(User patient) {
        return medicalRecordRepository.findByPatient(patient)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteRecord(Long recordId, User patient) throws Exception {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new Exception("Record not found"));

        if (!record.getPatient().getId().equals(patient.getId())) {
            throw new Exception("Unauthorized to delete this record");
        }

        // Delete the physical file
        Path filepath = Paths.get(record.getFilePath());
        Files.deleteIfExists(filepath);

        medicalRecordRepository.delete(record);
    }

    public MedicalRecord getRecordEntityById(Long recordId) throws Exception {
        return medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new Exception("Record not found"));
    }

    public MedicalRecordResponse mapToResponse(MedicalRecord record) {
        MedicalRecordResponse res = new MedicalRecordResponse();
        res.setId(record.getId());
        res.setTitle(record.getTitle());
        res.setCategory(record.getCategory());
        res.setUploadedAt(record.getUploadedAt());
        res.setAuditTrail(record.getAuditTrail());
        res.setPatientId(record.getPatient().getId());
        res.setPatientName(record.getPatient().getEmail()); // Or some other name field if available
        return res;
    }
}
