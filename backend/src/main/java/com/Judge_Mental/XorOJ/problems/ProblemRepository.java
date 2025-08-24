package com.Judge_Mental.XorOJ.problems;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findProblemById(Long id);
    List<Problem> findProblemsByTagsContaining(String tags);
    List<Problem> findProblemsByDifficultyRatingBetween(Integer minRating, Integer maxRating);
}
