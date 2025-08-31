package com.Judge_Mental.XorOJ.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.Submission;

import jakarta.persistence.QueryHint;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // Derived queries must traverse relation ids when using @ManyToOne
    List<Submission> findByUserIdAndContestId(Long userId, Long contestId);

    List<Submission> findByContestIdOrderBySubmissionTimeDesc(Long contestId);

    // Lightweight projection for standings rebuild
    interface SubmView {
        Long getUserId();
        Long getProblemId();
        Submission.SubmissionStatus getStatus();
        LocalDateTime getSubmissionTime();
    }

    // JPQL version (matches your entity’s property names)
    @Query("""
        select s.user.id          as userId,
               s.problem.id       as problemId,
               s.status           as status,
               s.submissionTime   as submissionTime
        from Submission s
        where s.contest.id = :contestId
        order by s.submissionTime asc, s.id asc
    """)
    @QueryHints(@QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "500"))
    Stream<SubmView> streamByContest(@Param("contestId") Long contestId);

    // If you prefer not to deal with Stream/transactions, use List instead:
    // @Query("""
    //     select s.user.id, s.problem.id, s.status, s.submissionTime
    //     from Submission s
    //     where s.contest.id = :contestId
    //     order by s.submissionTime asc, s.id asc
    // """)
    // List<SubmView> findFlatByContest(@Param("contestId") Long contestId);
}
