package com.example.civicpulse.repository;

import com.example.civicpulse.entity.Complaint;
import com.example.civicpulse.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface OfficerRepo extends JpaRepository<Officer, Long> {
    Optional<Officer> findByEmail(String email);
    List<Officer> findByDepartmentAndActiveTrue(String department);
    List<Officer> findAllByActiveTrue();
    // Officer sees their complaints
    @Query("SELECT c FROM Complaint c WHERE c.officerId = :officerId AND c.status != 'Completed'")
    List<Complaint> findByOfficerIdAndStatusNot(Long officerId, String status);

}

