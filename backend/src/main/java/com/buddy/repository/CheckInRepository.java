package com.buddy.repository;

import com.buddy.model.CheckIn;
import com.buddy.model.Goal;
import com.buddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    
    List<CheckIn> findByUser(User user);
    
    List<CheckIn> findByGoal(Goal goal);
    
    List<CheckIn> findByUserAndGoal(User user, Goal goal);
    
    // Find today's check-in for a specific goal
    Optional<CheckIn> findByUserAndGoalAndCheckInDate(User user, Goal goal, LocalDate checkInDate);
    
    // Find check-ins for a date range
    @Query("SELECT c FROM CheckIn c WHERE c.user = :user AND c.goal = :goal " +
           "AND c.checkInDate BETWEEN :startDate AND :endDate ORDER BY c.checkInDate DESC")
    List<CheckIn> findCheckInsInRange(@Param("user") User user, @Param("goal") Goal goal,
                                    @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find recent check-ins (last 7 days)
    @Query("SELECT c FROM CheckIn c WHERE c.user = :user " +
           "AND c.checkInDate >= :cutoffDate ORDER BY c.checkInDate DESC")
    List<CheckIn> findRecentCheckInsByUser(@Param("user") User user, @Param("cutoffDate") LocalDate cutoffDate);
    
    // Find streak data - consecutive check-ins
    @Query("SELECT c FROM CheckIn c WHERE c.user = :user AND c.goal = :goal " +
           "AND c.completed = true ORDER BY c.checkInDate DESC")
    List<CheckIn> findCompletedCheckInsForStreak(@Param("user") User user, @Param("goal") Goal goal);
    
    // Calculate average motivation level for a goal
    @Query("SELECT AVG(c.motivationLevel) FROM CheckIn c WHERE c.user = :user AND c.goal = :goal " +
           "AND c.motivationLevel IS NOT NULL")
    Double findAverageMotivationLevel(@Param("user") User user, @Param("goal") Goal goal);
    
    // Find check-ins that need buddy validation
    @Query("SELECT c FROM CheckIn c JOIN BuddyRelationship br ON c.goal = br.goal " +
           "WHERE (br.user1 = :buddy OR br.user2 = :buddy) AND br.status = 'ACTIVE' " +
           "AND c.user != :buddy AND c.buddyValidated = false " +
           "AND c.checkInDate >= :recentDate ORDER BY c.createdAt DESC")
    List<CheckIn> findCheckInsNeedingValidation(@Param("buddy") User buddy, @Param("recentDate") LocalDate recentDate);
    
    // Count completed check-ins for a goal
    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.user = :user AND c.goal = :goal AND c.completed = true")
    Long countCompletedCheckIns(@Param("user") User user, @Param("goal") Goal goal);
    
    // Find most active users (for leaderboards)
    @Query("SELECT c.user, COUNT(c) as checkInCount FROM CheckIn c " +
           "WHERE c.checkInDate >= :startDate AND c.completed = true " +
           "GROUP BY c.user ORDER BY checkInCount DESC")
    List<Object[]> findMostActiveUsers(@Param("startDate") LocalDate startDate);
    
    // Find check-ins with photos (for inspiration feed)
    @Query("SELECT c FROM CheckIn c WHERE SIZE(c.photoUrls) > 0 AND c.completed = true " +
           "ORDER BY c.createdAt DESC")
    List<CheckIn> findCheckInsWithPhotos();
    
    // Check if user has checked in today for any goal
    @Query("SELECT COUNT(c) > 0 FROM CheckIn c WHERE c.user = :user AND c.checkInDate = :today")
    Boolean hasCheckedInToday(@Param("user") User user, @Param("today") LocalDate today);
    
    // Find weekly summary data
    @Query("SELECT c.checkInDate, COUNT(c), AVG(c.motivationLevel) FROM CheckIn c " +
           "WHERE c.user = :user AND c.checkInDate BETWEEN :startDate AND :endDate " +
           "GROUP BY c.checkInDate ORDER BY c.checkInDate")
    List<Object[]> findWeeklySummary(@Param("user") User user, 
                                   @Param("startDate") LocalDate startDate, 
                                   @Param("endDate") LocalDate endDate);
} 