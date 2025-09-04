package com.Judge_Mental.XorOJ.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.entity.Contest;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.repo.ContestRepository;


@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepo;

    public Contest createContest(Long userId) {
        Contest contest = new Contest();
        contest.setAuthorId(userId);
        return contestRepo.save(contest);
    }

    public List<Contest> getAllContests() {
        return contestRepo.findAll();
    }

    public Contest findById(Long id) {
        Contest contest = contestRepo.findById(id).orElse(null);
        return contest;
    }

    public boolean registerUserForContest(Long contestId, com.Judge_Mental.XorOJ.entity.XUser user) {
        Contest contest = findById(contestId);
        if (contest != null) {
            contest.getParticipants().add(user);
            contestRepo.save(contest);
            return true;
        }
        return false;
    }

    public List<Contest> findContestsByAuthorId(Long authorId) {
        return contestRepo.findContestsByAuthorId(authorId);
    }
    
    public LocalDateTime getContestEndTime(Long contestId) {
        Contest contest = contestRepo.findById(contestId).orElse(null);
        if (contest != null) {
            return contest.getEndTime();
        }
        return null;
    }


    //Edit

    public boolean updateContestGeneralInfo(Long contestId, String title, String description, LocalDateTime startTime, LocalDateTime endTime) {
        Contest contest = findById(contestId);
        System.out.println("Updating contest: " + contestId);
        if (contest != null) {
            contest.setTitle(title);
            contest.setDescription(description);
            contest.setStartTime(startTime);
            contest.setEndTime(endTime);
            contest.setDuration((int) ChronoUnit.MINUTES.between(startTime, endTime));
            contestRepo.save(contest);
            return true;
        }
        return false;
    }

    public boolean updateContestProblems(Long contestId, List<Pair<Long, Integer>> requests) {
        Contest contest = findById(contestId);
        if (contest != null) {
            Set<Problem> problemsToKeep = new HashSet<>();
            
            for (Pair<Long, Integer> request : requests) {
                contest.getProblems().stream()
                    .filter(problem -> problem.getId().equals(request.getFirst()))
                    .findFirst()
                    .ifPresent(problem -> {
                        problem.setProblemNum(request.getSecond());
                        problemsToKeep.add(problem);
                    });
            }
            
            contest.getProblems().clear();
            contest.getProblems().addAll(problemsToKeep);
            
            contestRepo.save(contest);
            return true;
        }
        return false;
    }
}
