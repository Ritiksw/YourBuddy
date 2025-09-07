package com.buddy.repository;

import com.buddy.model.Goal;
import com.buddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByUser(User user);
    
    List<Goal> findByUserOrderByCreatedAtDesc(User user);
    
    List<Goal> findByUserAndStatus(User user, Goal.GoalStatus status);
    
    List<Goal> findByStatus(Goal.GoalStatus status);
    
    List<Goal> findByCategory(Goal.GoalCategory category);
    
    List<Goal> findByCategoryAndStatus(Goal.GoalCategory category, Goal.GoalStatus status);
    
    // Find public goals that need buddies
    @Query("SELECT g FROM Goal g WHERE g.isPublic = true AND g.status = 'ACTIVE' " +
           "AND g.user != :user " +
           "AND (SELECT COUNT(br) FROM BuddyRelationship br WHERE br.goal = g AND br.status = 'ACTIVE') < g.maxBuddies")
    List<Goal> findAvailableGoalsForMatching(@Param("user") User user);
    
    // Find goals by category that need buddies
    @Query("SELECT g FROM Goal g WHERE g.isPublic = true AND g.status = 'ACTIVE' " +
           "AND g.category = :category AND g.user != :user " +
           "AND (SELECT COUNT(br) FROM BuddyRelationship br WHERE br.goal = g AND br.status = 'ACTIVE') < g.maxBuddies")
    List<Goal> findAvailableGoalsByCategory(@Param("category") Goal.GoalCategory category, @Param("user") User user);
    
    // Find goals by location for local meetups
    @Query("SELECT g FROM Goal g WHERE g.isPublic = true AND g.status = 'ACTIVE' " +
           "AND g.requiresLocation = true AND g.location = :location AND g.user != :user")
    List<Goal> findGoalsByLocation(@Param("location") String location, @Param("user") User user);
    
    // Find goals with similar tags
    @Query("SELECT DISTINCT g FROM Goal g JOIN g.tags t WHERE g.isPublic = true " +
           "AND g.status = 'ACTIVE' AND g.user != :user AND t IN :tags")
    List<Goal> findGoalsByTags(@Param("tags") List<String> tags, @Param("user") User user);
    
    // Find overdue goals that might need support
    @Query("SELECT g FROM Goal g WHERE g.status = 'ACTIVE' AND g.targetDate < :currentDate")
    List<Goal> findOverdueGoals(@Param("currentDate") LocalDate currentDate);
    
    // Find goals starting soon (for matching preparation)
    @Query("SELECT g FROM Goal g WHERE g.isPublic = true AND g.status = 'ACTIVE' " +
           "AND g.startDate BETWEEN :startDate AND :endDate AND g.user != :user")
    List<Goal> findGoalsStartingSoon(@Param("startDate") LocalDate startDate, 
                                   @Param("endDate") LocalDate endDate, 
                                   @Param("user") User user);
    
    // Find goals by difficulty level
    List<Goal> findByDifficultyAndStatusAndIsPublic(Goal.DifficultyLevel difficulty, 
                                                   Goal.GoalStatus status, 
                                                   boolean isPublic);
    
    // Count active goals for a user
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.user = :user AND g.status = 'ACTIVE'")
    Long countActiveGoalsByUser(@Param("user") User user);
    
    // Find goals ending soon (for motivation)
    @Query("SELECT g FROM Goal g WHERE g.status = 'ACTIVE' " +
           "AND g.targetDate BETWEEN :currentDate AND :endDate")
    List<Goal> findGoalsEndingSoon(@Param("currentDate") LocalDate currentDate, 
                                 @Param("endDate") LocalDate endDate);
} 