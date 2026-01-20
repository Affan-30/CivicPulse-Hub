package com.example.civicpulse.controller;

import com.example.civicpulse.dto.ComplaintDto;
import com.example.civicpulse.dto.StatusUpdateRequest;
import com.example.civicpulse.repository.ComplaintRepo;
import com.example.civicpulse.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminComplaintController {
    @Autowired
    private ComplaintRepo repo;

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

    @GetMapping("/line-chart")
    public List<Map<String, Object>> getLineChartData() {
        List<Object[]> data = repo.getComplaintsPerDay();

        return data.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", obj[0].toString());
            map.put("count", obj[1]);
            return map;
        }).toList();
    }


}
