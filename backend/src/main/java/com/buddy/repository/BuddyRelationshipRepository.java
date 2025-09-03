package com.buddy.repository;

import com.buddy.model.BuddyRelationship;
import com.buddy.model.Goal;
import com.buddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BuddyRelationshipRepository extends JpaRepository<BuddyRelationship, Long> {
    
    // Find all relationships for a user
    @Query("SELECT br FROM BuddyRelationship br WHERE br.user1 = :user OR br.user2 = :user")
    List<BuddyRelationship> findByUser(@Param("user") User user);
    
    // Find active relationships for a user
    @Query("SELECT br FROM BuddyRelationship br WHERE (br.user1 = :user OR br.user2 = :user) " +
           "AND br.status = 'ACTIVE'")
    List<BuddyRelationship> findActiveRelationshipsByUser(@Param("user") User user);
    
    // Find relationship between two specific users
    @Query("SELECT br FROM BuddyRelationship br WHERE " +
           "((br.user1 = :user1 AND br.user2 = :user2) OR (br.user1 = :user2 AND br.user2 = :user1))")
    Optional<BuddyRelationship> findRelationshipBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Find relationships for a specific goal
    List<BuddyRelationship> findByGoal(Goal goal);
    
    List<BuddyRelationship> findByGoalAndStatus(Goal goal, BuddyRelationship.RelationshipStatus status);
    
    // Find pending buddy requests for a user
    @Query("SELECT br FROM BuddyRelationship br WHERE br.user2 = :user AND br.status = 'PENDING'")
    List<BuddyRelationship> findPendingRequestsForUser(@Param("user") User user);
    
    // Find sent requests by a user
    @Query("SELECT br FROM BuddyRelationship br WHERE br.user1 = :user AND br.status = 'PENDING'")
    List<BuddyRelationship> findSentRequestsByUser(@Param("user") User user);
    
    // Count active buddies for a goal
    @Query("SELECT COUNT(br) FROM BuddyRelationship br WHERE br.goal = :goal AND br.status = 'ACTIVE'")
    Long countActiveBuddiesByGoal(@Param("goal") Goal goal);
    
    // Find most successful buddy relationships (for recommendations)
    @Query("SELECT br FROM BuddyRelationship br WHERE br.status = 'COMPLETED' " +
           "ORDER BY br.interactionCount DESC, br.compatibilityScore DESC")
    List<BuddyRelationship> findMostSuccessfulRelationships();
    
    // Find relationships that need attention (low interaction)
    @Query("SELECT br FROM BuddyRelationship br WHERE br.status = 'ACTIVE' " +
           "AND br.lastInteraction < :cutoffDate")
    List<BuddyRelationship> findInactiveRelationships(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find relationships by compatibility score
    @Query("SELECT br FROM BuddyRelationship br WHERE br.status = 'ACTIVE' " +
           "AND br.compatibilityScore >= :minScore ORDER BY br.compatibilityScore DESC")
    List<BuddyRelationship> findHighCompatibilityRelationships(@Param("minScore") Integer minScore);
    
    // Check if user already has a buddy for this goal
    @Query("SELECT br FROM BuddyRelationship br WHERE br.goal = :goal " +
           "AND (br.user1 = :user OR br.user2 = :user) " +
           "AND br.status IN ('PENDING', 'ACTIVE')")
    Optional<BuddyRelationship> findExistingRelationshipForGoal(@Param("goal") Goal goal, @Param("user") User user);
} 