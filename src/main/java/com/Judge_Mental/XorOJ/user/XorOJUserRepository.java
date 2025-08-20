package com.Judge_Mental.XorOJ.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface XorOJUserRepository extends JpaRepository<XorOJUser, Long> {
    Optional<XorOJUser> findByUsername(String username);
    
}
