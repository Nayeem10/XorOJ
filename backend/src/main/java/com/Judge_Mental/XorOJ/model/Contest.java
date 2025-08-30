package com.Judge_Mental.XorOJ.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    private boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private XUser creator;

    @ManyToMany
    @JoinTable(
        name = "contest_problems",
        joinColumns = @JoinColumn(name = "contest_id"),
        inverseJoinColumns = @JoinColumn(name = "problem_id")
    )
    private Set<Problem> problems;

    @ManyToMany
    @JoinTable(
        name = "contest_participants",
        joinColumns = @JoinColumn(name = "contest_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<XUser> participants;

    private int duration; // in minutes

    @Enumerated(EnumType.STRING)
    private ContestStatus status = ContestStatus.UPCOMING;

    public enum ContestStatus {
        UPCOMING,
        RUNNING,
        ENDED
    }
}
