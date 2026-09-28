package com.mentorconnect.service;

import com.mentorconnect.model.InterestTag;
import com.mentorconnect.repository.InterestTagRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterestTagService {

    private final InterestTagRepository interestTagRepository;

    public InterestTagService(InterestTagRepository interestTagRepository) {
        this.interestTagRepository = interestTagRepository;
    }

    public InterestTag createInterestTag(InterestTag interestTag) {
        return interestTagRepository.save(interestTag);
    }

    public List<InterestTag> getAllInterestTags() {
        return interestTagRepository.findAll();
    }

    public InterestTag getInterestTagById(Long id) {
        return interestTagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest tag not found with id: " + id));
    }

    public void deleteInterestTag(Long id) {
        if (!interestTagRepository.existsById(id)) {
            throw new RuntimeException("Interest tag not found with id: " + id);
        }
        interestTagRepository.deleteById(id);
    }
}
