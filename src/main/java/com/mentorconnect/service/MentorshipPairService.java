package com.mentorconnect.service;

import com.mentorconnect.exception.MentorCapacityException;
import com.mentorconnect.exception.ResourceNotFoundException;
import com.mentorconnect.model.Alumni;
import com.mentorconnect.model.MentorshipPair;
import com.mentorconnect.repository.AlumniRepository;
import com.mentorconnect.repository.MentorshipPairRepository;
import com.mentorconnect.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MentorshipPairService {

    private final MentorshipPairRepository mentorshipPairRepository;
    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;

    public MentorshipPairService(MentorshipPairRepository mentorshipPairRepository,
                                 AlumniRepository alumniRepository,
                                 StudentRepository studentRepository) {
        this.mentorshipPairRepository = mentorshipPairRepository;
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
    }

    public MentorshipPair createMentorshipPair(MentorshipPair pair) {
        if (pair.getAlumniId() == null) {
            throw new ResourceNotFoundException("Alumni ID must not be null");
        }
        Alumni alumni = alumniRepository.findById(pair.getAlumniId())
                .orElseThrow(() -> new ResourceNotFoundException("Alumni not found with id: " + pair.getAlumniId()));

        if (pair.getStudentId() == null) {
            throw new ResourceNotFoundException("Student ID must not be null");
        }
        if (!studentRepository.existsById(pair.getStudentId())) {
            throw new ResourceNotFoundException("Student not found with id: " + pair.getStudentId());
        }

        long activeCount = mentorshipPairRepository.countByAlumniIdAndStatus(pair.getAlumniId(), "ACTIVE");
        if (activeCount >= alumni.getMaxMentees()) {
            throw new MentorCapacityException("Mentor has reached maximum mentee capacity");
        }

        if (pair.getStatus() == null || pair.getStatus().trim().isEmpty()) {
            pair.setStatus("ACTIVE");
        }

        if (pair.getMatchedAt() == null) {
            pair.setMatchedAt(LocalDateTime.now());
        }

        return mentorshipPairRepository.save(pair);
    }

    public List<MentorshipPair> getAllMentorshipPairs() {
        return mentorshipPairRepository.findAll();
    }

    public MentorshipPair getMentorshipPairById(Long id) {
        return mentorshipPairRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship pair not found with id: " + id));
    }

    public MentorshipPair updateMentorshipPair(Long id, MentorshipPair pair) {
        MentorshipPair existing = getMentorshipPairById(id);
        existing.setAlumniId(pair.getAlumniId());
        existing.setStudentId(pair.getStudentId());
        existing.setStatus(pair.getStatus());
        existing.setMatchedAt(pair.getMatchedAt());
        return mentorshipPairRepository.save(existing);
    }

    public void deleteMentorshipPair(Long id) {
        if (!mentorshipPairRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mentorship pair not found with id: " + id);
        }
        mentorshipPairRepository.deleteById(id);
    }
}
