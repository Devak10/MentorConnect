package com.mentorconnect.controller;

import com.mentorconnect.model.Alumni;
import com.mentorconnect.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Alumni>> findMatchesForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(matchingService.findMatchesForStudent(studentId));
    }
}
