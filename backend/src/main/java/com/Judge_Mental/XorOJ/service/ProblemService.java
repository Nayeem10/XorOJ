package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.repo.ProblemRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProblemService {
    @Autowired
    private com.Judge_Mental.XorOJ.repo.ContestRepository contestRepo;

    @Autowired
    private ProblemRepository problemRepo;
    
    public Problem findProblemById(Long id, Long userId) {
        Problem problem = problemRepo.findProblemById(id).orElse(null);
        if(problem == null){
            return null;
        }
        ContestResponseDTO contest = contestRepo.findContestByProblemId(id);
        if(contest.getStartTime().isBefore(LocalDateTime.now())) {
            return null;
        }
        return problem;
    }

    public List<Problem> findProblemsByDifficultyRating(Integer minRating, Integer maxRating) {
        if (minRating == null) minRating = 800;
        if (maxRating == null) maxRating = 4000;

        return problemRepo.findProblemsByDifficultyRatingBetween(minRating, maxRating);
    }
    public List<Problem> getAllProblems() {
        return problemRepo.findAll();
    }
    public List<Problem> findProblemsByAuthorId(Long authorId) {
        return problemRepo.findProblemsByAuthorId(authorId);
    }
    public Problem findProblemByIdAndAuthorId(Long id, Long authorId) {
        return problemRepo.findProblemByIdAndAuthorId(id, authorId);
    }
    public Problem createProblem(Problem problem) {
        return problemRepo.save(problem);
    }

    public Problem updateProblem(Problem problem) {
        return problemRepo.save(problem);
    }

    public ContestResponseDTO getContestByProblemId(Long problemId) {
        return contestRepo.findContestByProblemId(problemId);
    }
}
