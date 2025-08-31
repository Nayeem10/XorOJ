package com.Judge_Mental.XorOJ.dto;

import java.time.LocalDateTime;

import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;

import lombok.Data;

@Data
public class SubmissionResponseDTO {
    private Long id;
    private Long userId;
    private Long problemId;
    private String code;
    private String language;
    private LocalDateTime submissionTime;
    private SubmissionStatus status;
    private Integer executionTime;
    private Integer memoryUsed;

    // Getters and Setters

    public static SubmissionResponseDTO fromSubmission(Submission submission) {
        SubmissionResponseDTO dto = new SubmissionResponseDTO();
        dto.setId(submission.getId());
        dto.setUserId(submission.getUser().getId());
        dto.setProblemId(submission.getProblem().getId());
        dto.setCode(submission.getCode());
        dto.setLanguage(submission.getLanguage());
        dto.setSubmissionTime(submission.getSubmissionTime());
        dto.setStatus(submission.getStatus());
        dto.setExecutionTime(submission.getExecutionTime());
        dto.setMemoryUsed(submission.getMemoryUsed());
        return dto;
    }


}
