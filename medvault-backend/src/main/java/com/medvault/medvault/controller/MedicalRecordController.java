package com.medvault.medvault.controller;

import com.medvault.medvault.dto.MedicalRecordResponse;
import com.medvault.medvault.entity.ConsentStatus;
import com.medvault.medvault.entity.MedicalRecord;
import com.medvault.medvault.entity.RecordCategory;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.MedicalRecordService;
import com.medvault.medvault.service.UserService;
import com.medvault.medvault.repository.ConsentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private UserService userService;

    @Autowired
    private ConsentRepository consentRepository;

    /** Upload a new record (patient only). */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadRecord(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String categoryStr,
            Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            RecordCategory category = RecordCategory.valueOf(categoryStr.toUpperCase());
            MedicalRecordResponse response = medicalRecordService.uploadRecord(patient, file, title, category);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid record category");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** Get own records (patient). */
    @GetMapping
    public ResponseEntity<?> getMyRecords(Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<MedicalRecordResponse> records = medicalRecordService.getPatientRecords(patient);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Delete a record (patient only).
     *
     * FIX: Changed from ResponseEntity.noContent().build() (HTTP 204 with no body)
     * to ResponseEntity.ok("deleted"). With 204, Spring was forwarding the request
     * to /error which has no authenticated context, causing a secondary 403 from
     * Http403ForbiddenEntryPoint — that's the 403 you were seeing in the browser.
     * Returning 200 with a body stops that error-forwarding chain entirely.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable("id") Long id, Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            medicalRecordService.deleteRecord(id, patient);
            return ResponseEntity.ok("deleted");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** Update title/category of a record (patient only). */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRecord(@PathVariable("id") Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));
            if (!body.containsKey("title") && !body.containsKey("category")) {
                return ResponseEntity.badRequest().body("Nothing to update");
            }
            MedicalRecordResponse updated = medicalRecordService.updateRecord(
                    id, patient, body.get("title"), body.get("category"));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** Get a patient's records – doctors only, requires approved consent. */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientRecordsForDoctor(@PathVariable("patientId") Long patientId,
            Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("Doctor not found"));

            User patient = userService.findById(patientId)
                    .orElseThrow(() -> new Exception("Patient not found"));

            boolean hasConsent = consentRepository.findByDoctor(doctor).stream()
                    .anyMatch(c -> c.getPatient().getId().equals(patientId)
                            && c.getStatus() == ConsentStatus.APPROVED);

            if (!hasConsent) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: patient has not granted consent.");
            }

            List<MedicalRecordResponse> records = medicalRecordService.getPatientRecords(patient);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Stream the binary file stored in the DB.
     * Access: record owner (patient) OR doctor with approved consent.
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> downloadRecordFile(@PathVariable("id") Long id, Principal principal) {
        try {
            User caller = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            MedicalRecord record = medicalRecordService.getRecordEntityById(id);

            boolean isOwner = record.getPatient().getId().equals(caller.getId());

            boolean isConsentedDoctor = !isOwner &&
                    consentRepository.findByDoctor(caller).stream()
                            .anyMatch(c -> c.getPatient().getId().equals(record.getPatient().getId())
                                    && c.getStatus() == ConsentStatus.APPROVED);

            if (!isOwner && !isConsentedDoctor) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            byte[] data = record.getFileData();
            if (data == null || data.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String contentType = record.getContentType() != null
                    ? record.getContentType()
                    : "application/octet-stream";

            String displayName = record.getFileName() != null
                    ? record.getFileName()
                    : "record_" + id;

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + displayName + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(data);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}