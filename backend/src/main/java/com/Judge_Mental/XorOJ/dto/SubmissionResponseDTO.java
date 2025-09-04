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
    private String language;
    private LocalDateTime submissionTime;
    private SubmissionStatus status;
    private Long executionTime;
    private Long memoryUsed;
    private String filePath;

    // Getters and Setters

    public static SubmissionResponseDTO fromSubmission(Submission submission) {
        SubmissionResponseDTO dto = new SubmissionResponseDTO();
        dto.setId(submission.getId());
        dto.setUserId(submission.getUserId());
        dto.setProblemId(submission.getProblemId());
        dto.setLanguage(submission.getLanguage());
        dto.setSubmissionTime(submission.getSubmissionTime());
        dto.setStatus(submission.getStatus());
        dto.setExecutionTime(submission.getExecutionTime());
        dto.setMemoryUsed(submission.getMemoryUsed());
        dto.setFilePath(submission.getFilePath());
        return dto;
    }
}
