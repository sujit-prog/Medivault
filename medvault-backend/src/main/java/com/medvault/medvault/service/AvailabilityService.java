package com.medvault.medvault.service;

import com.medvault.medvault.entity.Availability;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.repository.AvailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.List;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    public Availability addSlot(User doctor, LocalDateTime start, LocalDateTime end) {
        Availability a = new Availability();
        a.setDoctor(doctor);
        a.setStartTime(start);
        a.setEndTime(end);

        return availabilityRepository.save(a);
    }

    public List<Availability> getDoctorAvailability(User doctor) {
        return availabilityRepository.findByDoctor(doctor);
    }

    public void deleteSlot(Long slotId, User doctor) throws Exception {
        Availability slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new Exception("Slot not found"));
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new Exception("Unauthorized to delete this slot");
        }
        availabilityRepository.delete(slot);
    }
}