package com.example.civicpulse.service;

import com.example.civicpulse.dto.ComplaintDto;
import com.example.civicpulse.dto.CreateComplaintRequest;
import com.example.civicpulse.dto.StatusUpdateRequest;
import com.example.civicpulse.entity.Complaint;
import com.example.civicpulse.entity.Officer;
import com.example.civicpulse.entity.User;
import com.example.civicpulse.repository.ComplaintRepo;
import com.example.civicpulse.repository.OfficerRepo;
import com.example.civicpulse.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.SQLOutput;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepo complaintRepository;
    private final UserRepo userRepo;
    private final EmailService emailService;

    @Autowired
    private ComplaintRepo complaintRepo;

    @Autowired
    private OfficerRepo officerRepo;

    public ComplaintService(ComplaintRepo complaintRepository, UserRepo userRepo, EmailService emailService) {
        this.complaintRepository = complaintRepository;
        this.userRepo = userRepo;
        this.emailService = emailService;
    }

    public ComplaintDto createComplaintForUser(String username,
                                               CreateComplaintRequest req,
                                               MultipartFile file) throws IOException, IOException {
        User user = userRepo.findByEmail(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        Complaint c = new Complaint();
        c.setUser(user);
        c.setCategory(req.getCategory());
        c.setDistrict(req.getDistrict());
        c.setDescription(req.getDescription());
        c.setStatus("Pending");
        c.setCreatedAt(LocalDateTime.now());
        c.setOfficerId(req.getOfficerId());
        c.setOfficerName(req.getOfficerName());
        c.setApprovalStatus("PENDING");
        c.setApprovalReason(null);

        // handle file if present
        if (file != null && !file.isEmpty()) {
            // choose a folder, e.g. src/main/resources/static/uploads/complaints
            Path uploadDir = Paths.get("uploads/complaints").toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String originalName = file.getOriginalFilename();
            String ext = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : "";
            String fileName = "complaint-" + System.currentTimeMillis() + ext;

            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // store relative path to DB
            c.setImagePath("http://localhost:8080/uploads/complaints/" + fileName);


            System.out.println("Upload dir: " + uploadDir.toAbsolutePath());
        }

        Complaint saved = complaintRepository.save(c);
        return toDto(saved);
    }


    // all complaints of a user
    public List<ComplaintDto> getComplaintsForUser(String email) {
        User user = userRepo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found: " + email);
        }

        return complaintRepository.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }



    // admin: all complaints
    public List<ComplaintDto> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ComplaintDto updateStatus(Long id, StatusUpdateRequest req) {
        Complaint c = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        c.setStatus(req.getStatus());
        Complaint saved = complaintRepository.save(c);

        // after saving, send email to complaint owner
        String userEmail = saved.getUser().getEmail();
        String userName  = saved.getUser().getName();

        String subject = "Your complaint #" + saved.getId() + " status updated";
        String body = "Dear " + userName + ",\n\n"
                + "The status of your complaint (ID: " + saved.getId() + ") has been updated to: "
                + saved.getStatus() + ".\n\n"
                + "Category: " + saved.getCategory() + "\n"
                + "Description: " + saved.getDescription() + "\n\n"
                + "Assigned To: " + saved.getOfficerName() + "\n\n"
                + "Resolution Notes (if any)" + saved.getResolutionNotes() + "\n\n"
                + "Regards,\nCivicPulse Hub";

        emailService.send(userEmail, subject, body);

        return toDto(saved);
    }


    private ComplaintDto toDto(Complaint c) {
        ComplaintDto dto = new ComplaintDto();
        dto.setId(c.getId());
        dto.setProofImg(c.getProofImg());
        dto.setCitizenId(c.getUser().getId());
        dto.setDistrict(c.getDistrict());
        dto.setCategory(c.getCategory());
        dto.setDescription(c.getDescription());
        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setImagePath(c.getImagePath());
        dto.setOfficerId(c.getOfficerId());
        dto.setOfficerName(c.getOfficerName());
dto.setResolutionNotes(c.getResolutionNotes());
dto.setFeedback(c.getFeedback());
dto.setDeadline(c.getDeadline());
dto.setApprovalStatus(c.getApprovalStatus());
dto.setApprovalReason(c.getApprovalReason());
        return dto;
    }

    // NEW: complaints filtered by department
    public List<ComplaintDto> getComplaintsByDepartment(String department) {
        List<Complaint> complaints = complaintRepository.findByCategory(department);
        // or complaintRepository.findByCategory(department) if using `category`
        return complaints.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Admin assigns officer
    public Complaint assignOfficer(Long complaintId, Long officerId, String officerName, LocalDate deadline) {
        Complaint complaint = complaintRepo.findById(complaintId).orElseThrow();
        Officer officer = officerRepo.findById(officerId).orElseThrow();

        complaint.setOfficerId(officerId);           // Links to officer
        complaint.setOfficerName(officer.getName()); // Display name
        complaint.setStatus("Assigned");
        complaint.setDeadline(deadline);

        System.out.println("Deadline is : "+deadline);
        complaintRepo.save(complaint);
        return complaint;
    }

    //Get all complaints by officer ID
    public List<ComplaintDto> getComplaintsByOfficerId(Long id) {
        List<Complaint> complaints = complaintRepository.findByOfficerId(id);
        return complaints.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }


    //  Officer resolves complaint
    public ComplaintDto resolveComplaint(Long complaintId, Long officerId, String resolutionNotes, MultipartFile file) {
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Verify officer owns this complaint
        if (!complaint.getOfficerId().equals(officerId)) {
            throw new RuntimeException("Not authorized to resolve this complaint");
        }

        // Only allow resolving "Assigned" complaints
        if (!"Assigned".equals(complaint.getStatus())) {
            throw new RuntimeException("Cannot resolve non-assigned complaints");
        }

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = "uploads/resolutions/";
                Files.createDirectories(Paths.get(uploadDir));

                String fileName = "resolution_" + complaintId + "_" + System.currentTimeMillis()
                        + "_" + file.getOriginalFilename();

                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, file.getBytes());

                complaint.setProofImg("http://localhost:8080/" + uploadDir + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store resolution image");
            }
        }

        complaint.setStatus("Resolved - Pending Review");
        complaint.setResolutionNotes(resolutionNotes);
        complaint.setUpdatedAt(LocalDateTime.now());

        return toDto(complaintRepo.save(complaint));
    }

    //User submits feedback
    public ComplaintDto giveFeedback(Long complaintId,String feedback){
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        System.out.println(complaint.getDescription());

        complaint.setFeedback(feedback);
        return toDto(complaintRepo.save(complaint));
    }

    public ComplaintDto Approvestatus(Long complaintId){
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setApprovalStatus("APPROVED");
        complaint.setApprovalReason(null);

        return toDto(complaintRepo.save(complaint));
    }

    public ComplaintDto Rejectstatus(Long complaintId, String reason){
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setApprovalStatus("REJECTED");
        complaint.setApprovalReason(reason);
        complaint.setStatus("Rejected");

        return toDto(complaintRepo.save(complaint));
    }

    public ComplaintDto reopen(Long id) {
        Complaint complaint = complaintRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setApprovalStatus("PENDING");
        complaint.setApprovalReason(null);
        complaint.setDeadline(null);
        complaint.setFeedback(null);
        complaint.setOfficerId(null);
        complaint.setOfficerName(null);
        complaint.setResolutionNotes(null);
        complaint.setProofImg(null);
        complaint.setStatus("Pending");

        return toDto(complaintRepo.save(complaint));
    }

    public boolean delete(Long id) {
        Complaint complaint = complaintRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        System.out.println("Complaint deleted : "+complaint.getId());

        complaintRepo.deleteById(id);

        return true;
    }
    }
