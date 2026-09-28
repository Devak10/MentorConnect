package com.mentorconnect.service;

import com.mentorconnect.model.Alumni;
import com.mentorconnect.model.Student;
import com.mentorconnect.repository.AlumniRepository;
import com.mentorconnect.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MatchingService {

    private final StudentRepository studentRepository;
    private final AlumniRepository alumniRepository;

    public MatchingService(StudentRepository studentRepository, AlumniRepository alumniRepository) {
        this.studentRepository = studentRepository;
        this.alumniRepository = alumniRepository;
    }

    public List<Alumni> findMatchesForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Set<String> studentInterests = parseTags(student.getInterests());
        List<Alumni> allAlumni = new ArrayList<>(alumniRepository.findAll());

        Map<Alumni, Integer> overlapMap = new HashMap<>();
        for (Alumni alumni : allAlumni) {
            overlapMap.put(alumni, calculateOverlap(studentInterests, alumni.getExpertise()));
        }

        allAlumni.sort((a1, a2) -> Integer.compare(overlapMap.get(a2), overlapMap.get(a1)));

        return allAlumni;
    }

    private Set<String> parseTags(String text) {
        Set<String> tags = new HashSet<>();
        if (text != null && !text.trim().isEmpty()) {
            String[] parts = text.split(",");
            for (String part : parts) {
                String trimmed = part.trim().toLowerCase();
                if (!trimmed.isEmpty()) {
                    tags.add(trimmed);
                }
            }
        }
        return tags;
    }

    private int calculateOverlap(Set<String> studentInterests, String expertise) {
        if (studentInterests.isEmpty() || expertise == null || expertise.trim().isEmpty()) {
            return 0;
        }
        Set<String> alumniTags = parseTags(expertise);
        int overlap = 0;
        for (String tag : alumniTags) {
            if (studentInterests.contains(tag)) {
                overlap++;
            }
        }
        return overlap;
    }
}
