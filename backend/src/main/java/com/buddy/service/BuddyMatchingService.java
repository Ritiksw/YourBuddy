package com.buddy.service;

import com.buddy.model.BuddyRelationship;
import com.buddy.model.CheckIn;
import com.buddy.model.Goal;
import com.buddy.model.User;
import com.buddy.repository.BuddyRelationshipRepository;
import com.buddy.repository.CheckInRepository;
import com.buddy.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class BuddyMatchingService {
    
    @Autowired
    private GoalRepository goalRepository;
    
    @Autowired
    private BuddyRelationshipRepository buddyRelationshipRepository;
    
    @Autowired
    private CheckInRepository checkInRepository;
    
    public List<Goal> findCompatibleGoals(User user) {
        // Get user's active goals to understand preferences
        List<Goal> userGoals = goalRepository.findByUserAndStatus(user, Goal.GoalStatus.ACTIVE);
        
        if (userGoals.isEmpty()) {
            // If no active goals, show all available goals
            return goalRepository.findAvailableGoalsForMatching(user);
        } else {
            // Find goals in similar categories
            Goal.GoalCategory primaryCategory = userGoals.get(0).getCategory();
            return goalRepository.findAvailableGoalsByCategory(primaryCategory, user);
        }
    }
    
    public int calculateCompatibilityScore(User user, Goal goal) {
        int score = 0;
        
        // Base score for goal category match
        List<Goal> userGoals = goalRepository.findByUserAndStatus(user, Goal.GoalStatus.ACTIVE);
        if (userGoals.stream().anyMatch(g -> g.getCategory() == goal.getCategory())) {
            score += 30; // Same category experience
        }
        
        // Difficulty level compatibility
        Goal.DifficultyLevel userPreferredDifficulty = getUserPreferredDifficulty(user);
        if (userPreferredDifficulty == goal.getDifficulty()) {
            score += 25; // Same difficulty preference
        } else if (Math.abs(userPreferredDifficulty.ordinal() - goal.getDifficulty().ordinal()) == 1) {
            score += 15; // Adjacent difficulty levels
        }
        
        // Timeline compatibility
        int timelineScore = calculateTimelineCompatibility(user, goal);
        score += timelineScore;
        
        // Location compatibility (if location-based goal)
        if (goal.isRequiresLocation() && goal.getLocation() != null) {
            // For now, simple location matching - could be enhanced with geo-distance
            score += 20; // Bonus for location-based goals
        }
        
        // User activity level compatibility
        int activityScore = calculateActivityCompatibility(user, goal.getUser());
        score += activityScore;
        
        return Math.min(100, Math.max(0, score)); // Ensure score is between 0-100
    }
    
    private Goal.DifficultyLevel getUserPreferredDifficulty(User user) {
        List<Goal> userGoals = goalRepository.findByUserAndStatus(user, Goal.GoalStatus.ACTIVE);
        if (userGoals.isEmpty()) {
            return Goal.DifficultyLevel.MEDIUM; // Default
        }
        
        // Return most common difficulty level from user's goals
        return userGoals.get(0).getDifficulty(); // Simplified - could be enhanced
    }
    
    private int calculateTimelineCompatibility(User user, Goal goal) {
        int score = 0;
        
        // Check if goal timeline is reasonable
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
        
        if (daysRemaining >= 7 && daysRemaining <= 90) {
            score += 15; // Good timeline (1 week to 3 months)
        } else if (daysRemaining >= 1 && daysRemaining <= 180) {
            score += 10; // Acceptable timeline
        }
        
        // Bonus if goal is starting soon
        long daysUntilStart = ChronoUnit.DAYS.between(LocalDate.now(), goal.getStartDate());
        if (daysUntilStart <= 7) {
            score += 10; // Starting soon
        }
        
        return score;
    }
    
    private int calculateActivityCompatibility(User user1, User user2) {
        // Calculate based on check-in frequency and consistency
        LocalDate oneWeekAgo = LocalDate.now().minusDays(7);
        
        // Count recent check-ins for both users
        List<CheckIn> user1CheckIns = checkInRepository.findRecentCheckInsByUser(user1, oneWeekAgo);
        List<CheckIn> user2CheckIns = checkInRepository.findRecentCheckInsByUser(user2, oneWeekAgo);
        
        int user1Activity = user1CheckIns.size();
        int user2Activity = user2CheckIns.size();
        
        // Similar activity levels get higher compatibility
        int activityDiff = Math.abs(user1Activity - user2Activity);
        
        if (activityDiff <= 1) {
            return 15; // Very similar activity levels
        } else if (activityDiff <= 3) {
            return 10; // Somewhat similar
        } else {
            return 5; // Different activity levels
        }
    }
    
    public BuddyRelationship requestBuddyship(User requester, Long goalId) throws Exception {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        
        // Check if goal is available for buddies
        Long currentBuddyCount = buddyRelationshipRepository.countActiveBuddiesByGoal(goal);
        if (currentBuddyCount >= goal.getMaxBuddies()) {
            throw new RuntimeException("This goal already has the maximum number of buddies");
        }
        
        // Check if user already has a relationship for this goal
        Optional<BuddyRelationship> existingRelationship = 
            buddyRelationshipRepository.findExistingRelationshipForGoal(goal, requester);
        if (existingRelationship.isPresent()) {
            throw new RuntimeException("You already have a relationship for this goal");
        }
        
        // Create buddy relationship request
        BuddyRelationship relationship = new BuddyRelationship(goal, goal.getUser(), requester);
        relationship.setCompatibilityScore(calculateCompatibilityScore(requester, goal));
        
        return buddyRelationshipRepository.save(relationship);
    }
    
    public BuddyRelationship acceptBuddyRequest(User user, Long relationshipId) throws Exception {
        BuddyRelationship relationship = buddyRelationshipRepository.findById(relationshipId)
                .orElseThrow(() -> new RuntimeException("Buddy request not found"));
        
        // Check if user is the goal owner (user1)
        if (!relationship.getUser1().getId().equals(user.getId())) {
            throw new RuntimeException("You can only accept requests for your own goals");
        }
        
        // Check if relationship is still pending
        if (relationship.getStatus() != BuddyRelationship.RelationshipStatus.PENDING) {
            throw new RuntimeException("This buddy request is no longer pending");
        }
        
        relationship.setStatus(BuddyRelationship.RelationshipStatus.ACTIVE);
        relationship.setStartedAt(java.time.LocalDateTime.now());
        
        return buddyRelationshipRepository.save(relationship);
    }
    
    public void rejectBuddyRequest(User user, Long relationshipId) throws Exception {
        BuddyRelationship relationship = buddyRelationshipRepository.findById(relationshipId)
                .orElseThrow(() -> new RuntimeException("Buddy request not found"));
        
        // Check if user is the goal owner (user1)
        if (!relationship.getUser1().getId().equals(user.getId())) {
            throw new RuntimeException("You can only reject requests for your own goals");
        }
        
        buddyRelationshipRepository.delete(relationship);
    }
    
    public List<BuddyRelationship> getUserBuddies(User user) {
        return buddyRelationshipRepository.findActiveRelationshipsByUser(user);
    }
    
    public List<BuddyRelationship> getPendingRequests(User user) {
        return buddyRelationshipRepository.findPendingRequestsForUser(user);
    }
} 