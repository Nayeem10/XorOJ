package com.Judge_Mental.XorOJ.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.model.Contest;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    public Contest findContestById(Long id);
}
