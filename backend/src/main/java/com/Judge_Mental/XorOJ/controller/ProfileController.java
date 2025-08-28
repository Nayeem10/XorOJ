package com.Judge_Mental.XorOJ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.model.XUser;
import com.Judge_Mental.XorOJ.repo.XUserRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    private XUserRepository repository;
    
    @GetMapping("{username}")
    public ResponseEntity<XUser> getProfileByUsername(@PathVariable String username) {
        XUser user = repository.findByUsername(username);

        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
