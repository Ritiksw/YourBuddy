package com.buddy.controller;

import com.buddy.model.Goal;
import com.buddy.model.User;
import com.buddy.repository.GoalRepository;
import com.buddy.repository.UserRepository;
import com.buddy.service.BuddyMatchingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/goals")
@CrossOrigin(origins = "*")
public class GoalController {
    
    @Autowired
    private GoalRepository goalRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BuddyMatchingService buddyMatchingService;
    
    @PostMapping
    public ResponseEntity<?> createGoal(@Valid @RequestBody Map<String, Object> goalData,
                                       Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = new Goal();
            goal.setTitle((String) goalData.get("title"));
            goal.setDescription((String) goalData.get("description"));
            goal.setCategory(Goal.GoalCategory.valueOf((String) goalData.get("category")));
            goal.setType(Goal.GoalType.valueOf((String) goalData.get("type")));
            goal.setDifficulty(Goal.DifficultyLevel.valueOf(
                (String) goalData.getOrDefault("difficulty", "MEDIUM")));
            goal.setUser(user);
            goal.setStartDate(LocalDate.parse((String) goalData.get("startDate")));
            goal.setTargetDate(LocalDate.parse((String) goalData.get("targetDate")));
            
            // Optional fields
            if (goalData.get("targetValue") != null) {
                goal.setTargetValue((Integer) goalData.get("targetValue"));
            }
            if (goalData.get("targetUnit") != null) {
                goal.setTargetUnit((String) goalData.get("targetUnit"));
            }
            if (goalData.get("location") != null) {
                goal.setLocation((String) goalData.get("location"));
                goal.setRequiresLocation(true);
            }
            if (goalData.get("maxBuddies") != null) {
                goal.setMaxBuddies((Integer) goalData.get("maxBuddies"));
            }
            if (goalData.get("tags") != null) {
                goal.setTags((List<String>) goalData.get("tags"));
            }
            
            Goal savedGoal = goalRepository.save(goal);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Goal created successfully!",
                    "goalId", savedGoal.getId(),
                    "goal", savedGoal
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to create goal: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getUserGoals(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Goal> goals = goalRepository.findByUser(user);
            
            return ResponseEntity.ok(Map.of(
                    "goals", goals,
                    "totalGoals", goals.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get goals: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{goalId}")
    public ResponseEntity<?> getGoal(@PathVariable Long goalId, Authentication authentication) {
        try {
            Goal goal = goalRepository.findById(goalId)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            
            // Add progress calculation
            Map<String, Object> goalData = new HashMap<>();
            goalData.put("goal", goal);
            goalData.put("progressPercentage", goal.getProgressPercentage());
            goalData.put("daysRemaining", goal.getDaysRemaining());
            goalData.put("totalDays", goal.getTotalDays());
            goalData.put("isOverdue", goal.isOverdue());
            
            return ResponseEntity.ok(goalData);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get goal: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{goalId}")
    public ResponseEntity<?> updateGoal(@PathVariable Long goalId,
                                       @RequestBody Map<String, Object> updates,
                                       Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = goalRepository.findById(goalId)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            
            // Check if user owns this goal
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You can only update your own goals"));
            }
            
            // Update allowed fields
            if (updates.get("title") != null) {
                goal.setTitle((String) updates.get("title"));
            }
            if (updates.get("description") != null) {
                goal.setDescription((String) updates.get("description"));
            }
            if (updates.get("status") != null) {
                goal.setStatus(Goal.GoalStatus.valueOf((String) updates.get("status")));
            }
            if (updates.get("currentProgress") != null) {
                goal.setCurrentProgress((Integer) updates.get("currentProgress"));
            }
            
            Goal updatedGoal = goalRepository.save(goal);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Goal updated successfully!",
                    "goal", updatedGoal
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update goal: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{goalId}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long goalId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = goalRepository.findById(goalId)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            
            // Check if user owns this goal
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You can only delete your own goals"));
            }
            
            goalRepository.delete(goal);
            
            return ResponseEntity.ok(Map.of("message", "Goal deleted successfully!"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete goal: " + e.getMessage()));
        }
    }
    
    @GetMapping("/discover")
    public ResponseEntity<?> discoverGoals(@RequestParam(required = false) String category,
                                         @RequestParam(required = false) String location,
                                         @RequestParam(required = false) String difficulty,
                                         Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Goal> availableGoals;
            
            if (category != null) {
                Goal.GoalCategory goalCategory = Goal.GoalCategory.valueOf(category.toUpperCase());
                availableGoals = goalRepository.findAvailableGoalsByCategory(goalCategory, user);
            } else if (location != null) {
                availableGoals = goalRepository.findGoalsByLocation(location, user);
            } else {
                availableGoals = goalRepository.findAvailableGoalsForMatching(user);
            }
            
            // Add compatibility scores for each goal
            List<Map<String, Object>> goalsWithScores = availableGoals.stream()
                    .map(goal -> {
                        Map<String, Object> goalData = new HashMap<>();
                        goalData.put("goal", goal);
                        goalData.put("compatibilityScore", 
                            buddyMatchingService.calculateCompatibilityScore(user, goal));
                        goalData.put("progressPercentage", goal.getProgressPercentage());
                        goalData.put("daysRemaining", goal.getDaysRemaining());
                        return goalData;
                    })
                    .sorted((a, b) -> Integer.compare(
                        (Integer) b.get("compatibilityScore"), 
                        (Integer) a.get("compatibilityScore")))
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "availableGoals", goalsWithScores,
                    "totalFound", goalsWithScores.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to discover goals: " + e.getMessage()));
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<?> getGoalCategories() {
        try {
            Goal.GoalCategory[] categories = Goal.GoalCategory.values();
            Goal.GoalType[] types = Goal.GoalType.values();
            Goal.DifficultyLevel[] difficulties = Goal.DifficultyLevel.values();
            
            return ResponseEntity.ok(Map.of(
                    "categories", categories,
                    "types", types,
                    "difficulties", difficulties
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get categories: " + e.getMessage()));
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<?> getActiveGoals(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, Goal.GoalStatus.ACTIVE);
            
            // Add progress data for each goal
            List<Map<String, Object>> goalsWithProgress = activeGoals.stream()
                    .map(goal -> {
                        Map<String, Object> goalData = new HashMap<>();
                        goalData.put("goal", goal);
                        goalData.put("progressPercentage", goal.getProgressPercentage());
                        goalData.put("daysRemaining", goal.getDaysRemaining());
                        goalData.put("isOverdue", goal.isOverdue());
                        return goalData;
                    })
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "activeGoals", goalsWithProgress,
                    "totalActive", goalsWithProgress.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get active goals: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{goalId}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable Long goalId,
                                          @RequestBody Map<String, Integer> progressData,
                                          Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = goalRepository.findById(goalId)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            
            // Check if user owns this goal
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You can only update your own goals"));
            }
            
            Integer newProgress = progressData.get("progress");
            if (newProgress != null) {
                goal.setCurrentProgress(newProgress);
                
                // Check if goal is completed
                if (goal.getTargetValue() != null && newProgress >= goal.getTargetValue()) {
                    goal.setStatus(Goal.GoalStatus.COMPLETED);
                    goal.setCompletedAt(java.time.LocalDateTime.now());
                }
                
                Goal updatedGoal = goalRepository.save(goal);
                
                return ResponseEntity.ok(Map.of(
                        "message", "Progress updated successfully!",
                        "goal", updatedGoal,
                        "progressPercentage", updatedGoal.getProgressPercentage(),
                        "isCompleted", updatedGoal.getStatus() == Goal.GoalStatus.COMPLETED
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Progress value is required"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update progress: " + e.getMessage()));
        }
    }
} 