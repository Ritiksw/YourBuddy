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
    public ResponseEntity<?> createGoal(@Valid @RequestBody Map<String, Object> goalRequest,
                                      Authentication authentication) {
        try {
            // Input validation
            String title = (String) goalRequest.get("title");
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Goal title is required"));
            }
            if (title.length() > 200) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Goal title must be less than 200 characters"));
            }
            
            String description = (String) goalRequest.get("description");
            if (description != null && description.length() > 1000) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Goal description must be less than 1000 characters"));
            }
            
            String categoryStr = (String) goalRequest.get("category");
            if (categoryStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Goal category is required"));
            }
            
            String startDateStr = (String) goalRequest.get("startDate");
            String targetDateStr = (String) goalRequest.get("targetDate");
            
            if (startDateStr == null || targetDateStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Start date and target date are required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = new Goal();
            goal.setUser(user);
            goal.setTitle(title.trim());
            goal.setDescription(description != null ? description.trim() : null);
            
            try {
                goal.setCategory(Goal.Category.valueOf(categoryStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid category. Valid categories: FITNESS, EDUCATION, HOBBY, CAREER, HEALTH, SOCIAL, CREATIVE, SPIRITUAL, OTHER"));
            }
            
            try {
                goal.setStartDate(LocalDate.parse(startDateStr));
                goal.setTargetDate(LocalDate.parse(targetDateStr));
                
                if (goal.getTargetDate().isBefore(goal.getStartDate())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Target date must be after start date"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
            }
            
            Goal savedGoal = goalRepository.save(goal);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Goal created successfully!",
                    "goalId", savedGoal.getId(),
                    "goal", savedGoal
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Goal creation service temporarily unavailable"));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getUserGoals(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Authentication required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Goal> goals = goalRepository.findByUser(user);
            
            return ResponseEntity.ok(Map.of(
                    "goals", goals,
                    "totalGoals", goals.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to retrieve goals"));
        }
    }
    
    @GetMapping("/{goalId}")
    public ResponseEntity<?> getGoal(@PathVariable Long goalId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Authentication required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = goalRepository.findById(goalId)
                    .orElse(null);
            
            if (goal == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user owns this goal
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You don't have permission to access this goal"));
            }
            
            return ResponseEntity.ok(goal);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to retrieve goal"));
        }
    }
    
    @PutMapping("/{goalId}")
    public ResponseEntity<?> updateGoal(@PathVariable Long goalId,
                                      @Valid @RequestBody Map<String, Object> goalRequest,
                                      Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Authentication required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = goalRepository.findById(goalId)
                    .orElse(null);
            
            if (goal == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user owns this goal
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You don't have permission to update this goal"));
            }
            
            // Update fields if provided
            String title = (String) goalRequest.get("title");
            if (title != null) {
                if (title.trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Goal title cannot be empty"));
                }
                if (title.length() > 200) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Goal title must be less than 200 characters"));
                }
                goal.setTitle(title.trim());
            }
            
            String description = (String) goalRequest.get("description");
            if (description != null) {
                if (description.length() > 1000) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Goal description must be less than 1000 characters"));
                }
                goal.setDescription(description.trim());
            }
            
            Goal savedGoal = goalRepository.save(goal);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Goal updated successfully!",
                    "goal", savedGoal
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Goal update service temporarily unavailable"));
        }
    }
    
    @DeleteMapping("/{goalId}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long goalId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Authentication required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Goal goal = goalRepository.findById(goalId)
                    .orElse(null);
            
            if (goal == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user owns this goal
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You don't have permission to delete this goal"));
            }
            
            goalRepository.delete(goal);
            
            return ResponseEntity.ok(Map.of("message", "Goal deleted successfully!"));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Goal deletion service temporarily unavailable"));
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