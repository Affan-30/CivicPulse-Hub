// com.example.civicpulse.repository.ComplaintRepository
package com.example.civicpulse.repository;

import com.example.civicpulse.entity.Complaint;
import com.example.civicpulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComplaintRepo extends JpaRepository<Complaint, Long> {

    // All complaints for a given user
    List<Complaint> findByUser(User user);

    void deleteById(Long id);

    List<Complaint> findByUserAndStatus(User user, String status);

    List<Complaint> findByCategory(String category);

    List<Complaint> findByOfficerId(Long id);


    // Officer dashboard query
    @Query("SELECT c FROM Complaint c WHERE c.officerId = :officerId AND c.status != 'Completed'")
    List<Complaint> findByOfficerIdAndStatusNot(
            @Param("officerId") Long officerId,
            @Param("status") String status
    );

    @Query("""
SELECT DATE(c.createdAt), COUNT(c)
FROM Complaint c
GROUP BY DATE(c.createdAt)
ORDER BY DATE(c.createdAt)
""")
    List<Object[]> getComplaintsPerDay();

}
