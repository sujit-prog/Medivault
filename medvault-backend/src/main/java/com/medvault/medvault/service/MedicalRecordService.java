package com.medvault.medvault.service;

import com.medvault.medvault.dto.MedicalRecordResponse;
import com.medvault.medvault.entity.MedicalRecord;
import com.medvault.medvault.entity.RecordCategory;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    /**
     * Upload a new medical record. File bytes are stored directly in the database
     * (LONGBLOB column) so there is no dependency on the local filesystem.
     *
     * FIX: Removed manual setUploadedAt() — @PrePersist on the entity already
     * handles this, so setting it twice was redundant and could cause confusion.
     */
    public MedicalRecordResponse uploadRecord(User patient, MultipartFile file,
            String title, RecordCategory category) throws IOException {
        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setTitle(title);
        record.setCategory(category);
        record.setFileName(file.getOriginalFilename());
        record.setContentType(file.getContentType() != null
                ? file.getContentType()
                : "application/octet-stream");
        record.setFileData(file.getBytes());
        record.setAuditTrail("Record uploaded.");

        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToResponse(saved);
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

        medicalRecordRepository.delete(record);
    }

    public MedicalRecordResponse updateRecord(Long recordId, User patient,
            String newTitle, String newCategoryStr) throws Exception {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new Exception("Record not found"));

        if (!record.getPatient().getId().equals(patient.getId())) {
            throw new Exception("Unauthorized to update this record");
        }

        String changes = "";
        if (newTitle != null && !newTitle.isBlank() && !newTitle.equals(record.getTitle())) {
            changes += "Title changed from \"" + record.getTitle() + "\" to \"" + newTitle + "\". ";
            record.setTitle(newTitle);
        }
        if (newCategoryStr != null && !newCategoryStr.isBlank()) {
            RecordCategory newCategory;
            try {
                newCategory = RecordCategory.valueOf(newCategoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new Exception("Invalid category");
            }
            if (!newCategory.equals(record.getCategory())) {
                changes += "Category changed from " + record.getCategory() + " to " + newCategory + ".";
                record.setCategory(newCategory);
            }
        }
        if (!changes.isBlank()) {
            // FIX: appendAudit no longer calls save() internally — the single save()
            // below (inside the @Transactional boundary) persists everything at once.
            appendAudit(record, changes.trim());
        }

        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToResponse(saved);
    }

    /**
     * Returns the full entity (including fileData) for the file-download endpoint.
     */
    public MedicalRecord getRecordEntityById(Long recordId) throws Exception {
        return medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new Exception("Record not found"));
    }

    /**
     * FIX: Removed the redundant medicalRecordRepository.save(record) call that
     * was here before. The caller (updateRecord) already saves inside the same
     * 
     * @Transactional method, so a second save was unnecessary and caused a
     *                double-write on every update.
     */
    private void appendAudit(MedicalRecord record, String entry) {
        String timestamp = java.time.format.DateTimeFormatter
                .ofPattern("yyyy-MM-dd HH:mm")
                .format(java.time.LocalDateTime.now());
        String line = "[" + timestamp + "] " + entry;
        String existing = record.getAuditTrail();
        record.setAuditTrail(existing == null || existing.isBlank() ? line : existing + "\n" + line);
    }

    public MedicalRecordResponse mapToResponse(MedicalRecord record) {
        MedicalRecordResponse res = new MedicalRecordResponse();
        res.setId(record.getId());
        res.setTitle(record.getTitle());
        res.setCategory(record.getCategory());
        res.setUploadedAt(record.getUploadedAt());
        res.setAuditTrail(record.getAuditTrail());
        res.setPatientId(record.getPatient().getId());
        res.setPatientName(record.getPatient().getEmail());
        res.setFileUrl("/api/records/" + record.getId() + "/file");
        res.setFileName(record.getFileName());
        return res;
    }
}