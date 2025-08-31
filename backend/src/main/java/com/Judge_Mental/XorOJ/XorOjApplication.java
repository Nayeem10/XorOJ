package com.Judge_Mental.XorOJ;

import com.Judge_Mental.XorOJ.entity.*;
import com.Judge_Mental.XorOJ.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;

@SpringBootApplication
public class XorOjApplication {

    public static void main(String[] args) {
        SpringApplication.run(XorOjApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(
            XUserRepository userRepo,
            ProblemRepository problemRepo,
            ContestRepository contestRepo,
            SubmissionRepository submissionRepo,
            PasswordEncoder passwordEncoder
    ) {
        return _ -> {
            // Clear existing data
            submissionRepo.deleteAll();
            contestRepo.deleteAll();
            problemRepo.deleteAll();
            userRepo.deleteAll();

            // Create users
            XUser admin = new XUser();
            admin.setUsername("admin");
            admin.setEmail("admin@xoroj.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setFirstName("Admin");
            admin.setLastName("User");
            
            XUser user1 = new XUser();
            user1.setUsername("user1");
            user1.setEmail("user1@example.com");
            user1.setPassword(passwordEncoder.encode("user123"));
            user1.setRole("USER");
            user1.setFirstName("Test");
            user1.setLastName("User");

            // Save users and get the saved entities
            admin = userRepo.save(admin);
            user1 = userRepo.save(user1);

            // Create problems
            Problem problem1 = new Problem();
            problem1.setTitle("Two Sum");
            problem1.setStatement("Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.");
            problem1.setDifficultyRating(1000); // Easy
            problem1.setTimeLimit(1000); // 1 second
            problem1.setMemoryLimit(256000); // 256MB

            Problem problem2 = new Problem();
            problem2.setTitle("Reverse String");
            problem2.setStatement("Write a function that reverses a string. The input string is given as an array of characters s.");
            problem2.setDifficultyRating(800); // Easy
            problem2.setTimeLimit(1000);
            problem2.setMemoryLimit(256000);

            // Save problems and get the saved entities
            problem1 = problemRepo.save(problem1);
            problem2 = problemRepo.save(problem2);

            // Create contest
            Contest contest = new Contest();
            contest.setTitle("Weekly Contest #1");
            contest.setDescription("First weekly programming contest");
            contest.setStartTime(LocalDateTime.now().plusDays(0).plusHours(0).plusSeconds(30));
            contest.setEndTime(LocalDateTime.now().plusDays(0).plusHours(2));
            contest.setCreator(admin);
            contest.setProblems(new HashSet<>(Arrays.asList(problem1, problem2)));
            contest.setParticipants(new HashSet<>(Arrays.asList(user1)));
            contest.setDuration(120); // 2 hours

            contestRepo.save(contest);

            // Create submissions
            Submission submission1 = new Submission();
            submission1.setUser(user1);
            submission1.setProblem(problem1);
            submission1.setContest(contest);
            submission1.setCode("public class Solution { public int[] twoSum(int[] nums, int target) { return null; } }");
            submission1.setLanguage("java");
            submission1.setSubmissionTime(LocalDateTime.now());
            submission1.setStatus(Submission.SubmissionStatus.WRONG_ANSWER);
            submission1.setExecutionTime(100);
            submission1.setMemoryUsed(50000);
            submission1.setScore(0);

            Submission submission2 = new Submission();
            submission2.setUser(user1);
            submission2.setProblem(problem1);
            submission2.setCode("class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { return {}; } };");
            submission2.setLanguage("cpp");
            submission2.setSubmissionTime(LocalDateTime.now());
            submission2.setStatus(Submission.SubmissionStatus.COMPILATION_ERROR);
            submission2.setErrorMessage("missing include statements");
            submission2.setScore(0);

            // Save submissions one by one to avoid any type casting issues
            submissionRepo.save(submission1);
            submissionRepo.save(submission2);
            
            System.out.println("Database initialized with dummy data!");
        };
    }
}
