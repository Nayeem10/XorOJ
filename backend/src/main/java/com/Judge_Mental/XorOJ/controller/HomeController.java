package com.Judge_Mental.XorOJ.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.model.XUser;
import com.Judge_Mental.XorOJ.repo.XUserRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class HomeController {

    @Autowired
    private XUserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/")
    public String home(HttpServletRequest request) {
        return "Welcome to XorOJ!" + request.getSession().getId();
    }
    //hello
    @PostMapping
    public ResponseEntity<XUser> createUser(@RequestBody XUser newUser) {
        try {
            
            // Check if username already exists
            if (repository.findByUsername(newUser.getUsername()) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
            }
            
            // Check if email already exists
            if (repository.findByEmail(newUser.getEmail()) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
            }
            System.out.println(newUser.getPassword());
            System.out.println(newUser.getUsername());
            // Encode the password before saving
            newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

            // Set default role if not provided
            if (newUser.getRole() == null || newUser.getRole().isEmpty()) {
                newUser.setRole("USER");
            }
            
            // Save the new user
            XUser savedUser = repository.save(newUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
            
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}