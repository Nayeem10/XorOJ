package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "problem_contributors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemContributor {
    
    @EmbeddedId
    private ProblemContributorId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("problemId")
    @JoinColumn(name = "problem_id")
    private Problem problem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private XUser user;
    
    @Column(nullable = false)
    private String role;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemContributorId implements Serializable {
        private Long problemId;
        private Long userId;
    }
}
