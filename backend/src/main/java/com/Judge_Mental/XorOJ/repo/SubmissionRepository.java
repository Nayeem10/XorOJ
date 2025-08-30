package com.Judge_Mental.XorOJ.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.model.Submission;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    public Submission findSubmissionById(Long id);
    List<Submission> findByUserIdAndContestId(Long userId, Long contestId);
    List<Submission> findByContestIdOrderBySubmissionTimeDesc(Long contestId);
}
