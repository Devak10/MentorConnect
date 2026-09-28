package com.mentorconnect.repository;

import com.mentorconnect.model.InterestTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterestTagRepository extends JpaRepository<InterestTag, Long> {
}
