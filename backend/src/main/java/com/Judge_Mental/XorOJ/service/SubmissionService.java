package com.Judge_Mental.XorOJ.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.repo.SubmissionRepository;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    public Submission createSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public List<Submission> getSubmissionsByUserIDandContestID(Long userId, Long contestId) {
        return submissionRepository.findByUserIdAndContestId(userId, contestId);
    }

    public List<Submission> getPaginatedContestSubmissions(Long contestId, int pageNumber) {
        if (pageNumber < 1) {
            return List.of();
        }
        
        List<Submission> allSubmissions = submissionRepository.findByContestIdOrderBySubmissionTimeDesc(contestId);
        int startIndex = (pageNumber - 1) * 20;
        
        if (startIndex >= allSubmissions.size()) {
            return List.of();
        }
        
        int endIndex = Math.min(startIndex + 20, allSubmissions.size());
        return allSubmissions.subList(startIndex, endIndex);
    }
}
