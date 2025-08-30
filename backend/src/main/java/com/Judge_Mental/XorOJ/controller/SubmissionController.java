package com.Judge_Mental.XorOJ.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.dto.SubmissionResponseDTO;
import com.Judge_Mental.XorOJ.model.Submission;
import com.Judge_Mental.XorOJ.service.SubmissionService;
import com.Judge_Mental.XorOJ.model.XUser;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @GetMapping("contests/{id}/my")
    public List<SubmissionResponseDTO> getSubmissionsForContest(
        @PathVariable Long id,
        @AuthenticationPrincipal(expression = "user") XUser user) {

        List<Submission> submissions = submissionService.getSubmissionsByUserIDandContestID(user.getId(), id);
        return submissions.stream()
           .map(SubmissionResponseDTO::fromSubmission)
           .collect(Collectors.toList());
    }

    @GetMapping("contests/{id}/page/{pageNumber}")
    public List<SubmissionResponseDTO> getPaginatedSubmissions(
        @PathVariable Long id,
        @PathVariable int pageNumber) {
        
        List<Submission> submissions = submissionService.getPaginatedContestSubmissions(id, pageNumber);
        return submissions.stream()
           .map(SubmissionResponseDTO::fromSubmission)
           .collect(Collectors.toList());
    }
}
