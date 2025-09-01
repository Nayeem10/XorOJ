package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    Long userId; // ID of the user who made the submission

    Long contestId; // ID of the contest (if any)

    Long problemId; // ID of the problem being submitted

    @Lob
    @Column(nullable = false, length = 50000)
    private String code;

    @Column(nullable = false)
    private ProgrammingLanguage language; // e.g., "cpp", "java", "python"

    @Column(nullable = false)
    private LocalDateTime submissionTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    @Column
    private Integer executionTime; // in milliseconds

    @Column
    private Integer memoryUsed; // in kilobytes

    @Column(length = 1000)
    private String errorMessage;

    @Column
    private Integer score; // 0-100

    // Define submission status enum
    public enum SubmissionStatus {
        PENDING,
        RUNNING,
        ACCEPTED,
        WRONG_ANSWER,
        TIME_LIMIT_EXCEEDED,
        MEMORY_LIMIT_EXCEEDED,
        COMPILATION_ERROR,
        RUNTIME_ERROR
    }
    public enum ProgrammingLanguage {
        CPP,
        JAVA,
        PYTHON
    }

}
