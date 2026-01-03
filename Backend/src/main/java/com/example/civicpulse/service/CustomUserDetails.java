package com.example.civicpulse.service;

import com.example.civicpulse.entity.Officer;
import com.example.civicpulse.entity.User;
import com.example.civicpulse.repository.OfficerRepo;
import com.example.civicpulse.repository.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetails implements UserDetailsService {

    private UserRepo userRepo;
    private OfficerRepo officerRepo;

public CustomUserDetails(UserRepo userRepo, OfficerRepo officerRepo){
    this.userRepo = userRepo;
    this.officerRepo = officerRepo;
}

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // 1️⃣ Try USER
        Optional<User> userOpt = Optional.ofNullable(userRepo.findByEmail(email));
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole()) // USER / ADMIN
                    .build();
        }

        // 2️⃣ Try OFFICER
        Optional<Officer> officerOpt = officerRepo.findByEmail(email);
        if (officerOpt.isPresent()) {
            Officer officer = officerOpt.get();
            return org.springframework.security.core.userdetails.User
                    .withUsername(officer.getEmail())
                    .password(officer.getPassword())
                    .roles("OFFICER")
                    .build();
        }
        throw new UsernameNotFoundException("User not found with given username!");
    }
}
