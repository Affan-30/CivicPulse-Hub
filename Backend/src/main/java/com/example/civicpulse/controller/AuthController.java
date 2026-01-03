package com.example.civicpulse.controller;

import com.example.civicpulse.dto.LoginDto;
import com.example.civicpulse.dto.UserDto;
import com.example.civicpulse.entity.Officer;
import com.example.civicpulse.entity.User;
import com.example.civicpulse.repository.OfficerRepo;
import com.example.civicpulse.repository.UserRepo;
import com.example.civicpulse.service.CustomUserDetails;
import com.example.civicpulse.service.OfficerService;
import com.example.civicpulse.service.UserService;
import com.example.civicpulse.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class AuthController {

    private final UserService userService;
    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetails customUserDetails;
    private final JwtUtil jwtUtil;
    private final OfficerService officerService;
    @Autowired
    private OfficerRepo officerRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthController(UserService userService,
                          UserRepo userRepo,
                          AuthenticationManager authenticationManager,
                          CustomUserDetails customUserDetails,
                          JwtUtil jwtUtil,
                          OfficerService officerService) {
        this.userService = userService;
        this.userRepo = userRepo;
        this.authenticationManager = authenticationManager;
        this.customUserDetails = customUserDetails;
        this.jwtUtil = jwtUtil;
        this.officerService = officerService;
    }

    // register endpoint now accepts JSON
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserDto request) {
        if("OFFICER".equals(request.getRole())){
            officerService.registerOfficer(request);
            return ResponseEntity.ok("Officer Registration Successful");
        }else {
            // CHANGED: pass name + role + email + password in correct order
            userService.registerUser(
                    request.getName(),
                    request.getRole(),
                    request.getEmail(),
                    request.getPassword()
            );
            return ResponseEntity.ok("User registered successfully");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDto request) {
        try {
            // NEW: First check if it's an Officer login
            Optional<Officer> officerOpt = officerRepo.findByEmail(request.getEmail());
            if (officerOpt.isPresent()) {
                Officer officer = officerOpt.get();

                // Verify officer password
                if (!passwordEncoder.matches(request.getPassword(), officer.getPassword())) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("Incorrect Email or Password");
                }

                List<String> officerRoles = List.of("OFFICER");

                String jwt = jwtUtil.generateToken(officer.getEmail(), officerRoles);

                Map<String, Object> body = new HashMap<>();
                body.put("token", jwt);
                body.put("name", officer.getName());
                body.put("role", "OFFICER");  // Clean role for frontend
                body.put("id", officer.getId());
                body.put("department", officer.getDepartment());
                System.out.println(jwt);
                return ResponseEntity.ok(body);
            }

            // ORIGINAL: Existing User login (citizen/admin)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = customUserDetails.loadUserByUsername(request.getEmail());
            User user = userRepo.findByEmail(request.getEmail());

            // ✅ FIXED: Extract roles from UserDetails for consistent JWT
            List<String> userRoles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(role -> role.replace("ROLE_", ""))
                    .collect(Collectors.toList());

            String jwt = jwtUtil.generateToken(user.getEmail(), userRoles);

            Map<String, Object> body = new HashMap<>();
            body.put("token", jwt);
            body.put("name", user.getName());
            body.put("role", user.getRole());

            return ResponseEntity.ok(body);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Incorrect Email or Password");
        }
    }

}
