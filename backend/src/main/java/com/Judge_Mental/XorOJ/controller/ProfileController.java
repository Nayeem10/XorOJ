package com.Judge_Mental.XorOJ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.repo.XUserRepository;


@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    
    @Autowired
    private XUserRepository repository;

    public record UserProfileDTO(String username, String email, String firstName, String lastName, String bio, String institute, String country, String contact, Boolean isItMe) {
        public static UserProfileDTO fromEntity(XUser user, Boolean isItMe) {
            return new UserProfileDTO(user.getUsername(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getBio(), user.getInstitute(), user.getCountry(), user.getContact(), isItMe);
        }
    }
    
    @GetMapping("{username}")
    public ResponseEntity<UserProfileDTO> getProfileByUsername(@PathVariable String username) {
        XUser user = repository.findByUsername(username);

        if (user != null) {
            return ResponseEntity.ok(UserProfileDTO.fromEntity(user, user.equals(user)));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<UserProfileDTO> createProfile(
        @RequestBody UserProfileDTO userProfileDTO,
        @AuthenticationPrincipal(expression = "user") XUser user
    ) {
        user.setUsername(userProfileDTO.username());
        user.setEmail(userProfileDTO.email());
        user.setFirstName(userProfileDTO.firstName());
        user.setLastName(userProfileDTO.lastName());
        user.setBio(userProfileDTO.bio());
        user.setInstitute(userProfileDTO.institute());
        user.setCountry(userProfileDTO.country());
        user.setContact(userProfileDTO.contact());

        XUser savedUser = repository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserProfileDTO.fromEntity(savedUser, savedUser.equals(user)));
    }
}
