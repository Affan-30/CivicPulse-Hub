package com.example.civicpulse.service;

import com.example.civicpulse.dto.LoginDto;
import com.example.civicpulse.dto.OfficerDto;
import com.example.civicpulse.dto.UserDto;
import com.example.civicpulse.entity.Officer;
import com.example.civicpulse.repository.OfficerRepo;
import com.example.civicpulse.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OfficerService {
    @Autowired
    private OfficerRepo officerRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;


    public Officer registerOfficer(UserDto req) {
        if (officerRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Officer email already exists");
        }

        Officer officer = new Officer();
        officer.setName(req.getName());
        officer.setEmail(req.getEmail());
        officer.setPassword(passwordEncoder.encode(req.getPassword()));
        // CRITICAL: Ensure department is set (with fallback)
        String department = req.getDepartment();
//        }
        officer.setDepartment(department);
        officer.setActive(true);
        officer.setCreatedAt(LocalDateTime.now());
        officer.setPhone(req.getPhone());

        System.out.println(req.getRole());
        System.out.println(req.getDepartment());
        System.out.println(req.getPhone());
        return officerRepo.save(officer);
    }

    public Map<String, Object> officerLogin(LoginDto req) {
        Officer officer = officerRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (!passwordEncoder.matches(req.getPassword(), officer.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(officer.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("name", officer.getName());
        response.put("role", "OFFICER");
        response.put("id", officer.getId());
        response.put("department", officer.getDepartment());
        response.put("phone", officer.getPhone());

        return response;
    }
}
