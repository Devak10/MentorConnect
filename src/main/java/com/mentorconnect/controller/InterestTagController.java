package com.mentorconnect.controller;

import com.mentorconnect.model.InterestTag;
import com.mentorconnect.service.InterestTagService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interests")
public class InterestTagController {

    private final InterestTagService interestTagService;

    public InterestTagController(InterestTagService interestTagService) {
        this.interestTagService = interestTagService;
    }

    @PostMapping
    public ResponseEntity<InterestTag> createInterestTag(@RequestBody InterestTag interestTag) {
        InterestTag created = interestTagService.createInterestTag(interestTag);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InterestTag>> getAllInterestTags() {
        return ResponseEntity.ok(interestTagService.getAllInterestTags());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterestTag> getInterestTagById(@PathVariable Long id) {
        return ResponseEntity.ok(interestTagService.getInterestTagById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterestTag(@PathVariable Long id) {
        interestTagService.deleteInterestTag(id);
        return ResponseEntity.noContent().build();
    }
}
