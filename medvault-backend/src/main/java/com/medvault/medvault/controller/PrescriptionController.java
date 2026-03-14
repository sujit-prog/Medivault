package com.medvault.medvault.controller;

import com.medvault.medvault.dto.PrescriptionResponse;
import com.medvault.medvault.entity.Prescription;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.PrescriptionService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private UserService userService;

    /**
     * Doctor creates a prescription.
     * Accepts multipart/form-data: patientId (required), medicines, notes, image
     * (optional).
     */
    @PostMapping
    public ResponseEntity<?> createPrescription(
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "medicines", required = false) String medicines,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("Doctor not found"));

            PrescriptionResponse response = prescriptionService
                    .createPrescription(doctor, patientId, medicines, notes, image);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Patient retrieves all prescriptions written for them.
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyPrescriptions(Principal principal) {
        try {
            User patient = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));
            List<PrescriptionResponse> list = prescriptionService.getPrescriptionsForPatient(patient);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Doctor retrieves all prescriptions they have sent.
     */
    @GetMapping("/sent")
    public ResponseEntity<?> getSentPrescriptions(Principal principal) {
        try {
            User doctor = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));
            List<PrescriptionResponse> list = prescriptionService.getPrescriptionsForDoctor(doctor);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Stream the prescription image.
     * Accessible by either the patient or the issuing doctor.
     */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getPrescriptionImage(
            @PathVariable("id") Long id,
            Principal principal) {
        try {
            User caller = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            Prescription prescription = prescriptionService.getPrescriptionEntity(id);

            boolean isPatient = prescription.getPatient().getId().equals(caller.getId());
            boolean isDoctor = prescription.getDoctor().getId().equals(caller.getId());

            if (!isPatient && !isDoctor) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            byte[] data = prescription.getImageData();
            if (data == null || data.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String contentType = prescription.getImageContentType() != null
                    ? prescription.getImageContentType()
                    : "application/octet-stream";

            String displayName = prescription.getImageName() != null
                    ? prescription.getImageName()
                    : "prescription_" + id;

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
