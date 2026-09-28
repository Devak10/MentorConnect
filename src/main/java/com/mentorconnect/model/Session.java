package com.mentorconnect.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "session")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mentorship_pair_id", nullable = false)
    private Long mentorshipPairId;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    private String status;

    @Column
    private String notes;

    public Session() {
    }

    public Session(Long mentorshipPairId, LocalDateTime scheduledAt, String status, String notes) {
        this.mentorshipPairId = mentorshipPairId;
        this.scheduledAt = scheduledAt;
        this.status = status;
        this.notes = notes;
    }

    public Session(Long id, Long mentorshipPairId, LocalDateTime scheduledAt, String status, String notes) {
        this.id = id;
        this.mentorshipPairId = mentorshipPairId;
        this.scheduledAt = scheduledAt;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMentorshipPairId() {
        return mentorshipPairId;
    }

    public void setMentorshipPairId(Long mentorshipPairId) {
        this.mentorshipPairId = mentorshipPairId;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
