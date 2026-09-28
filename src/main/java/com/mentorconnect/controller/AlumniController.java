package com.mentorconnect.controller;

import com.mentorconnect.model.Alumni;
import com.mentorconnect.service.AlumniService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumni")
public class AlumniController {

    private final AlumniService alumniService;

    public AlumniController(AlumniService alumniService) {
        this.alumniService = alumniService;
    }

    @PostMapping
    public ResponseEntity<Alumni> createAlumni(@RequestBody Alumni alumni) {
        Alumni created = alumniService.createAlumni(alumni);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Alumni>> getAllAlumni() {
        return ResponseEntity.ok(alumniService.getAllAlumni());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alumni> getAlumniById(@PathVariable Long id) {
        return ResponseEntity.ok(alumniService.getAlumniById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alumni> updateAlumni(@PathVariable Long id, @RequestBody Alumni alumni) {
        return ResponseEntity.ok(alumniService.updateAlumni(id, alumni));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlumni(@PathVariable Long id) {
        alumniService.deleteAlumni(id);
        return ResponseEntity.noContent().build();
    }
}
