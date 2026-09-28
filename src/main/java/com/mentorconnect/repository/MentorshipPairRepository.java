package com.mentorconnect.repository;

import com.mentorconnect.model.MentorshipPair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentorshipPairRepository extends JpaRepository<MentorshipPair, Long> {
    long countByAlumniIdAndStatus(Long alumniId, String status);
}
