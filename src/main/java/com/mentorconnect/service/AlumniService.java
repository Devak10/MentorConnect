package com.mentorconnect.service;

import com.mentorconnect.model.Alumni;
import com.mentorconnect.repository.AlumniRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumniService {

    private final AlumniRepository alumniRepository;

    public AlumniService(AlumniRepository alumniRepository) {
        this.alumniRepository = alumniRepository;
    }

    public Alumni createAlumni(Alumni alumni) {
        return alumniRepository.save(alumni);
    }

    public List<Alumni> getAllAlumni() {
        return alumniRepository.findAll();
    }

    public Alumni getAlumniById(Long id) {
        return alumniRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumni not found with id: " + id));
    }

    public Alumni updateAlumni(Long id, Alumni alumni) {
        Alumni existing = getAlumniById(id);
        existing.setName(alumni.getName());
        existing.setEmail(alumni.getEmail());
        existing.setExpertise(alumni.getExpertise());
        existing.setMaxMentees(alumni.getMaxMentees());
        return alumniRepository.save(existing);
    }

    public void deleteAlumni(Long id) {
        if (!alumniRepository.existsById(id)) {
            throw new RuntimeException("Alumni not found with id: " + id);
        }
        alumniRepository.deleteById(id);
    }
}
