package com.Judge_Mental.XorOJ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.repo.XUserRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    public record UserProfileDTO(String username, String email, String firstName, String lastName) {
        public static UserProfileDTO fromEntity(XUser user) {
            return new UserProfileDTO(user.getUsername(), user.getEmail(), user.getFirstName(), user.getLastName());
        }
    }

    @Autowired
    private XUserRepository repository;
    
    @GetMapping("{username}")
    public ResponseEntity<UserProfileDTO> getProfileByUsername(@PathVariable String username) {
        XUser user = repository.findByUsername(username);

        if (user != null) {
            return ResponseEntity.ok(UserProfileDTO.fromEntity(user));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
