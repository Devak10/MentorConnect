package com.mentorconnect.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_pair")
public class MentorshipPair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alumni_id", nullable = false)
    private Long alumniId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String status;

    @Column(name = "matched_at")
    private LocalDateTime matchedAt;

    public MentorshipPair() {
    }

    public MentorshipPair(Long alumniId, Long studentId, String status, LocalDateTime matchedAt) {
        this.alumniId = alumniId;
        this.studentId = studentId;
        this.status = status;
        this.matchedAt = matchedAt;
    }

    public MentorshipPair(Long id, Long alumniId, Long studentId, String status, LocalDateTime matchedAt) {
        this.id = id;
        this.alumniId = alumniId;
        this.studentId = studentId;
        this.status = status;
        this.matchedAt = matchedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAlumniId() {
        return alumniId;
    }

    public void setAlumniId(Long alumniId) {
        this.alumniId = alumniId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getMatchedAt() {
        return matchedAt;
    }

    public void setMatchedAt(LocalDateTime matchedAt) {
        this.matchedAt = matchedAt;
    }
}
