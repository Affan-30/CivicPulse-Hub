package com.example.civicpulse.service;

import com.example.civicpulse.entity.User;
import com.example.civicpulse.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepo){
        this.userRepo = userRepo;
    }

    public void registerUser(String name,String role, String email, String password){
        User user = new User();

        user.setName(name);
        user.setRole(role);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepo.save(user);
    }

    // SECURE validateUser
    public boolean validateUser(String email, String rawPassword) {
        User user = userRepo.findByEmail(email);
        if (user == null) {
            return false;
        }
        // matches(rawPassword, encodedPassword)
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }


}
