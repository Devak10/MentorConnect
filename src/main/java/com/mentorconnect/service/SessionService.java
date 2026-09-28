package com.mentorconnect.service;

import com.mentorconnect.model.Session;
import com.mentorconnect.repository.SessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public Session createSession(Session session) {
        return sessionRepository.save(session);
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public Session getSessionById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
    }

    public Session updateSession(Long id, Session session) {
        Session existing = getSessionById(id);
        existing.setMentorshipPairId(session.getMentorshipPairId());
        existing.setScheduledAt(session.getScheduledAt());
        existing.setStatus(session.getStatus());
        existing.setNotes(session.getNotes());
        return sessionRepository.save(existing);
    }

    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new RuntimeException("Session not found with id: " + id);
        }
        sessionRepository.deleteById(id);
    }
}
