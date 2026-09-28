package com.mentorconnect.controller;

import com.mentorconnect.model.MentorshipPair;
import com.mentorconnect.service.MentorshipPairService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentorships")
public class MentorshipPairController {

    private final MentorshipPairService mentorshipPairService;

    public MentorshipPairController(MentorshipPairService mentorshipPairService) {
        this.mentorshipPairService = mentorshipPairService;
    }

    @PostMapping
    public ResponseEntity<MentorshipPair> createMentorshipPair(@RequestBody MentorshipPair pair) {
        MentorshipPair created = mentorshipPairService.createMentorshipPair(pair);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MentorshipPair>> getAllMentorshipPairs() {
        return ResponseEntity.ok(mentorshipPairService.getAllMentorshipPairs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorshipPair> getMentorshipPairById(@PathVariable Long id) {
        return ResponseEntity.ok(mentorshipPairService.getMentorshipPairById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MentorshipPair> updateMentorshipPair(@PathVariable Long id, @RequestBody MentorshipPair pair) {
        return ResponseEntity.ok(mentorshipPairService.updateMentorshipPair(id, pair));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMentorshipPair(@PathVariable Long id) {
        mentorshipPairService.deleteMentorshipPair(id);
        return ResponseEntity.noContent().build();
    }
}
