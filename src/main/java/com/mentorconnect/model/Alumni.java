package com.mentorconnect.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "alumni")
public class Alumni {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String expertise;

    @Column(name = "max_mentees", nullable = false)
    private int maxMentees;

    public Alumni() {
    }

    public Alumni(String name, String email, String expertise, int maxMentees) {
        this.name = name;
        this.email = email;
        this.expertise = expertise;
        this.maxMentees = maxMentees;
    }

    public Alumni(Long id, String name, String email, String expertise, int maxMentees) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.expertise = expertise;
        this.maxMentees = maxMentees;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getExpertise() {
        return expertise;
    }

    public void setExpertise(String expertise) {
        this.expertise = expertise;
    }

    public int getMaxMentees() {
        return maxMentees;
    }

    public void setMaxMentees(int maxMentees) {
        this.maxMentees = maxMentees;
    }
}
