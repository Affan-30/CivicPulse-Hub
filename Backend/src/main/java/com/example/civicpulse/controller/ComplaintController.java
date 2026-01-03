package com.example.civicpulse.controller;

import com.example.civicpulse.dto.ComplaintDto;
import com.example.civicpulse.dto.CreateComplaintRequest;
import com.example.civicpulse.entity.Complaint;
import com.example.civicpulse.entity.Officer;
import com.example.civicpulse.repository.ComplaintRepo;
import com.example.civicpulse.repository.OfficerRepo;
import com.example.civicpulse.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    private final ComplaintService complaintService;

    @Autowired
    private OfficerRepo officerRepo;

    @Autowired
    private ComplaintRepo complaintRepo;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ComplaintDto createComplaint(
            @AuthenticationPrincipal UserDetails principal,
            @RequestPart("data") CreateComplaintRequest req,
            @RequestPart(name = "file", required = false) MultipartFile file
    ) throws IOException {

        String username = principal.getUsername();
        return complaintService.createComplaintForUser(username, req, file);
    }


    @GetMapping("/my")
    public List<ComplaintDto> getMyComplaints(Authentication authentication) {
        String username = authentication.getName();
        return complaintService.getComplaintsForUser(username);
    }

//    Assign complaint to available officer
@PutMapping("/{id}/assign")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ComplaintDto> assignOfficer(
                                                    @PathVariable Long id,
                                                    @RequestBody ComplaintDto request) {

    Complaint updated = complaintService.assignOfficer(id,
            request.getOfficerId(),
            request.getOfficerName(),
            request.getDeadline()
    );

    ComplaintDto response = new ComplaintDto();
    response.setOfficerId(updated.getOfficerId());
    response.setOfficerName(updated.getOfficerName());
    response.setDeadline(updated.getDeadline());
    // Add other fields as needed

    return ResponseEntity.ok(response);
}



    //OFFICER: Get their assigned complaints
    @GetMapping("/my-assigned")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<List<ComplaintDto>> getMyAssignedComplaints(Authentication authentication) {
        String officerEmail = authentication.getName(); // From JWT

        Optional<Officer> officer = officerRepo.findByEmail(officerEmail);
        if (officer.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<ComplaintDto> complaints = complaintService
                .getComplaintsByOfficerId(officer.get().getId());

        return ResponseEntity.ok(complaints);
    }

    //OFFICER: Resolve complaint (Mark as Resolved - Pending Review)
    @PostMapping(
            value = "/{id}/resolve",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('ROLE_OFFICER')")
    public ResponseEntity<ComplaintDto> resolveComplaint(
            @PathVariable Long id,
            @RequestPart("resolutionNotes") String resolutionNotes,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication
    ) {

        String officerEmail = authentication.getName();
        Officer officer = officerRepo.findByEmail(officerEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        ComplaintDto updated =
                complaintService.resolveComplaint(id, officer.getId(), resolutionNotes, file);

        return ResponseEntity.ok(updated);
    }


    @PostMapping("/{id}/feedback")
    public ResponseEntity<ComplaintDto> setFeedback(@PathVariable Long id, @RequestBody ComplaintDto req, Authentication authentication){
        String complaint = authentication.getName();
        ComplaintDto updated = complaintService.giveFeedback(id, req.getFeedback());

        System.out.println(req.getOfficerId());
        System.out.println(req.getId());
        System.out.println(req.getFeedback());

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ComplaintDto> approve(@PathVariable Long id) {
        System.out.println("APPROVE HIT");

        ComplaintDto dto = complaintService.Approvestatus(id);

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ComplaintDto> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        System.out.println("REJECT HIT");

        String reason = body.getOrDefault("reason", "No reason provided");
        ComplaintDto dto = complaintService.Rejectstatus(id, reason);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/reopen")
    public ResponseEntity<ComplaintDto> reopen(@PathVariable Long id){
        ComplaintDto dto = complaintService.reopen(id);

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Boolean> delete(@PathVariable Long id){
        boolean dto = complaintService.delete(id);

        return ResponseEntity.ok(dto);
    }
}
