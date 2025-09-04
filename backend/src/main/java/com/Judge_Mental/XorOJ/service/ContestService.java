package com.Judge_Mental.XorOJ.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.entity.Contest;
import com.Judge_Mental.XorOJ.repo.ContestRepository;


@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepo;

    public List<Contest> getAllContests() {
        return contestRepo.findAll();
    }

    public Contest findById(Long id) {
        Contest contest = contestRepo.findById(id).orElse(null);
        if (contest != null) {
            if(contest.getStartTime().isBefore(LocalDateTime.now())) {
                if(contest.getEndTime().isBefore(LocalDateTime.now()))
                    contest.setStatus(Contest.ContestStatus.ENDED);
                else
                    contest.setStatus(Contest.ContestStatus.RUNNING);
            }

        }
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
}
