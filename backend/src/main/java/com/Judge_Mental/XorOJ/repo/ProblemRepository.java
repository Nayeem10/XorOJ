package com.Judge_Mental.XorOJ.repo;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.ProblemContributor;


@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findProblemById(Long id);
    List<Problem> findProblemsByTagsContaining(String tags);
    List<Problem> findProblemsByDifficultyRatingBetween(Integer minRating, Integer maxRating);
    List<Problem> findProblemsByAuthorId(Long authorId);
    Problem findProblemByIdAndAuthorId(Long id, Long authorId);
    Set<ProblemContributor> findContributorsById(Long id);
}
