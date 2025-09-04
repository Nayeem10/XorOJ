package com.Judge_Mental.XorOJ.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.dto.SubmissionResponseDTO;
import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.judge.CppExecutor.RunResult;
import com.Judge_Mental.XorOJ.service.JudgingService;
import com.Judge_Mental.XorOJ.service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private JudgingService judgingService;

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

    public record submissionDTO(String code, String language, String stdin) {}
    @PostMapping("contests/{contestId}/problems/{problemId}/submit")
    public SubmissionResponseDTO submitSolution(
        @PathVariable Long contestId,
        @PathVariable Long problemId,
        @AuthenticationPrincipal(expression = "user") XUser user,
        @RequestBody submissionDTO submission) throws IOException {

        Submission savedSubmission = submissionService.createSubmissionFromString(
            submission.code(),
            problemId,
            contestId,
            user.getId(),
            submission.language()
        );
        
        return SubmissionResponseDTO.fromSubmission(savedSubmission);
    }

    public record runRequest(String code, String language, String stdin) {}
    @PostMapping("/test")
    public RunResult submitSolution(
        @RequestBody runRequest request) throws IOException, InterruptedException {
        return judgingService.runCodeWithTest(request.code(), request.stdin());
    }
    
    public record SubmissionRequest(String code, String language, Long problemId, Long contestId) {}
    
    // @PostMapping("/submit")
    // public SubmissionResponseDTO submitSolutionToFile(
    //     @RequestBody SubmissionRequest request,
    //     @AuthenticationPrincipal(expression = "user") XUser user) throws IOException {
        
    //     // Create submission using service method
    //     Submission savedSubmission = submissionService.createSubmissionFromString(
    //         request.code(), 
    //         request.problemId(), 
    //         request.contestId(), 
    //         user.getId(), 
    //         Submission.ProgrammingLanguage.valueOf(request.language().toUpperCase())
    //     );
        
    //     // Convert to response DTO
    //     return SubmissionResponseDTO.fromSubmission(savedSubmission);
    // }

    @PostMapping(value = "/testfile", consumes = "multipart/form-data")
    public RunResult submitSolution(
            @RequestPart("code") String codeFile,
            @RequestPart("input") String inputFile
    ) throws IOException, InterruptedException {

        String code  = new String(codeFile.getBytes());
        String input = new String(inputFile.getBytes());

        return judgingService.runCodeWithTest(code, input);
    }
}
