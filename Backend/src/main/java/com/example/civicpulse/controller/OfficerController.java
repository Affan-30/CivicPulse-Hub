package com.example.civicpulse.controller;

import com.example.civicpulse.dto.OfficerDto;
import com.example.civicpulse.entity.Officer;
import com.example.civicpulse.repository.OfficerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class OfficerController {
    @Autowired
    private OfficerRepo officerRepo;

    @GetMapping("/officers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OfficerDto>> getActiveOfficers() {
        List<Officer> officers = officerRepo.findAllByActiveTrue();

        List<OfficerDto> dtos = officers.stream()
                .map(o -> new OfficerDto(o.getId(), o.getName(), o.getDepartment()))
                .collect(Collectors.toList());

        System.out.println();
        System.out.println("Active officers: " + dtos.size());
        System.out.println(dtos.getFirst().getName());
        System.out.println(dtos.get(1).getName());
        System.out.println(dtos.getLast().getName());
        System.out.println();
        return ResponseEntity.ok(dtos);
    }
}

