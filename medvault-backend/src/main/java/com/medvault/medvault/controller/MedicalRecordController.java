package com.medvault.medvault.controller;

import com.medvault.medvault.dto.MedicalRecordResponse;
import com.medvault.medvault.entity.RecordCategory;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.MedicalRecordService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private UserService userService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id, Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            medicalRecordService.deleteRecord(id, patient);
            return ResponseEntity.ok("Record deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
