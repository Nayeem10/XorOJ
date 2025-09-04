package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long authorId;

    @OneToMany
    @JoinTable(
        name = "contest_problems",
        joinColumns = @JoinColumn(name = "contest_id"),
        inverseJoinColumns = @JoinColumn(name = "problem_id")
    )
    @JsonIgnoreProperties({"contributors", "tags"})
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
    
    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }
}
