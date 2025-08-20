package com.Judge_Mental.XorOJ.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.Judge_Mental.XorOJ.user.XorOJUserService;

import lombok.AllArgsConstructor;


@Configuration
@AllArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private final XorOJUserService userService;

    @Bean
    public XorOJUserService userService() {
        return userService;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
        .csrf(csrf -> csrf.disable())
        .authenticationProvider(authenticationProvider())
        .formLogin(httpForm -> {

            httpForm
            .loginPage("/login")              // GET login page
            .loginProcessingUrl("/req/login") // POST login submit
            .failureUrl("/login?error")
            .permitAll();
            httpForm.defaultSuccessUrl("/index", true); // after success

      })
    
        .authorizeHttpRequests(reg -> {
            reg.requestMatchers("/signup", "/req/signup", "/css/**", "/js/**").permitAll();
            reg.anyRequest().authenticated();
        })

        .build();
    }
}