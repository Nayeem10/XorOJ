package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.ProblemContributor;
import com.Judge_Mental.XorOJ.repo.ContestRepository;
import com.Judge_Mental.XorOJ.repo.ProblemContributorRepository;
import com.Judge_Mental.XorOJ.repo.ProblemRepository;
import com.Judge_Mental.XorOJ.repo.XUserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProblemService {
    @Autowired
    private XUserRepository xuserRepo;

    @Autowired
    private ContestRepository contestRepo;

    @Autowired
    private ProblemRepository problemRepo;

    @Autowired
    private ProblemContributorRepository problemContributorRepo;

    public Problem findProblemById(Long id) {
        Problem problem = problemRepo.findProblemById(id).orElse(null);
        if(problem == null){
            return null;
        }
        ContestResponseDTO contest = contestRepo.findContestByProblemId(id);
        if(contest != null && !contest.getStartTime().isBefore(LocalDateTime.now())) {
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
    public Problem createProblem(Problem problem, Long authorId) {
        problem.setAuthorId(authorId);
        // Save the problem first to get the ID
        Problem savedProblem = problemRepo.save(problem);
        
        // Create and save the contributor with the problem entity and user entity
        ProblemContributor contributor = new ProblemContributor(
            savedProblem, 
            xuserRepo.findById(authorId).orElse(null), 
            "Author"
        );
        problemContributorRepo.save(contributor);
        
        return savedProblem;
    }

    public Problem updateProblem(Problem problem) {
        return problemRepo.save(problem);
    }

    public ContestResponseDTO getContestByProblemId(Long problemId) {
        return contestRepo.findContestByProblemId(problemId);
    }





    // Edit page

    public boolean authorHaveAccess(Long userId, Long problemId) {
        return problemContributorRepo.existsByProblemIdAndUserId(problemId, userId) ? true : false;
    }

    public boolean updateProblem(Long problemId, Long userId, String inputFileType, String outputFileType, int timeLimit, int memoryLimit, List<String> tags) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null || authorHaveAccess(userId, problemId)) {
            return false;
        }
        problem.setInputFileType(inputFileType);
        problem.setOutputFileType(outputFileType);
        problem.setTimeLimit(timeLimit);
        problem.setMemoryLimit(memoryLimit);
        problem.setTags(tags);
        problemRepo.save(problem);
        return true;
    }

    public boolean updateProblem(Long userId, Long problemId, String title, String description, String inputFormat, String outputFormat, String notes, String sampleInput, String sampleOutput, Integer difficultyRating) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null || !authorHaveAccess(userId, problemId)) {
            return false;
        }
        problem.setTitle(title);
        problem.setDescription(description);
        problem.setInputFormat(inputFormat);
        problem.setOutputFormat(outputFormat);
        problem.setNotes(notes);
        problem.setSampleInput(sampleInput);
        problem.setSampleOutput(sampleOutput);
        problem.setDifficultyRating(difficultyRating);
        problemRepo.save(problem);
        return true;
    }
}
