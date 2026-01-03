package com.example.civicpulse.controller;

import com.example.civicpulse.dto.ComplaintDto;
import com.example.civicpulse.dto.StatusUpdateRequest;
import com.example.civicpulse.service.ComplaintService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // Update status
    @PatchMapping("/{id}/status")
    public ComplaintDto updateStatus(@PathVariable Long id,
                                     @RequestBody StatusUpdateRequest req) {
        return complaintService.updateStatus(id, req);
    }

    @GetMapping
    public List<ComplaintDto> getComplaints(@RequestParam(required = false) String department) {
        if (department != null && !department.isBlank()) {
            return complaintService.getComplaintsByDepartment(department);
        }
        return complaintService.getAllComplaints();
    }

}
