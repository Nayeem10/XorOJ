package com.Judge_Mental.XorOJ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.user.XorOJUser;
import com.Judge_Mental.XorOJ.user.XorOJUserRepository;

@RestController
public class RegistrationController {
    @Autowired
    private XorOJUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(value = "/req/signup", consumes = "application/json")
    public XorOJUser createUser(@RequestBody XorOJUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
