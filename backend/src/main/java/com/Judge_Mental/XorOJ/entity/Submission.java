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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private XUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id")
    private Contest contest; // null if not part of a contest

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false, length = 50000)
    private String code;

    @Column(nullable = false)
    private String language; // e.g., "cpp", "java", "python"

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

    @Column(nullable = false)
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

}
