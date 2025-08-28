package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.model.Problem;
import com.Judge_Mental.XorOJ.repo.ProblemRepository;

import java.util.List;

@Service
public class ProblemService {

    @Autowired
    private ProblemRepository problemRepo;

    public List<Problem> findProblemsByDifficultyRating(Integer minRating, Integer maxRating) {
        if (minRating == null) minRating = 800;
        if (maxRating == null) maxRating = 4000;

        return problemRepo.findProblemsByDifficultyRatingBetween(minRating, maxRating);
    }
}
