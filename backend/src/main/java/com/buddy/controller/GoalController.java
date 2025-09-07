package com.buddy.controller;

import com.buddy.model.Goal;
import com.buddy.model.User;
import com.buddy.repository.GoalRepository;
import com.buddy.repository.UserRepository;
import com.buddy.service.BuddyMatchingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/goals")
@CrossOrigin(origins = "*")
public class GoalController {
    
    private static final Logger logger = LoggerFactory.getLogger(GoalController.class);
    
    @Autowired
    private GoalRepository goalRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private BuddyMatchingService buddyMatchingService;
    
    @PostMapping
    public ResponseEntity<?> createGoal(@Valid @RequestBody Map<String, Object> goalRequest,
                                       Authentication authentication) {
        try {
            // Check authentication first
            logger.debug("Creating goal - Authentication check: {}", authentication != null ? "present" : "null");
            if (authentication != null) {
                logger.debug("Authentication details - Name: {}, Authenticated: {}, Principal type: {}", 
                    authentication.getName(), 
                    authentication.isAuthenticated(),
                    authentication.getPrincipal().getClass().getSimpleName());
            }
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Goal creation failed - Authentication missing or invalid");
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Authentication required to create goals"));
            }
            
            // Validate authentication principal
            if (!(authentication.getPrincipal() instanceof UserDetails)) {
                logger.warn("Goal creation failed - Invalid principal type: {}", 
                    authentication.getPrincipal().getClass().getSimpleName());
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid authentication token"));
            }
            
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
            
            // Set category
            try {
                goal.setCategory(Goal.GoalCategory.valueOf(categoryStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid category. Valid categories: FITNESS, EDUCATION, HOBBY, CAREER, HEALTH, SOCIAL, CREATIVE, SPIRITUAL, OTHER"));
            }
            
            // Set type (default to HABIT if not provided)
            String typeStr = (String) goalRequest.get("type");
            if (typeStr != null) {
                try {
                    goal.setType(Goal.GoalType.valueOf(typeStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    goal.setType(Goal.GoalType.HABIT); // default
                }
            } else {
                goal.setType(Goal.GoalType.HABIT);
            }
            
            // Set difficulty
            String difficultyStr = (String) goalRequest.get("difficulty");
            if (difficultyStr != null) {
                try {
                    goal.setDifficulty(Goal.DifficultyLevel.valueOf(difficultyStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    goal.setDifficulty(Goal.DifficultyLevel.MEDIUM); // default
                }
            } else {
                goal.setDifficulty(Goal.DifficultyLevel.MEDIUM);
            }
            
            // Set dates
            try {
                goal.setStartDate(LocalDate.parse(startDateStr));
                goal.setTargetDate(LocalDate.parse(targetDateStr));
                
                if (goal.getTargetDate().isBefore(goal.getStartDate()) || goal.getTargetDate().isEqual(goal.getStartDate())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Target date must be after start date"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
            }
            
            // Set optional fields
            Object targetValueObj = goalRequest.get("targetValue");
            if (targetValueObj != null) {
                try {
                    if (targetValueObj instanceof String && !((String) targetValueObj).trim().isEmpty()) {
                        goal.setTargetValue(Integer.parseInt((String) targetValueObj));
                    } else if (targetValueObj instanceof Number) {
                        goal.setTargetValue(((Number) targetValueObj).intValue());
                    }
                } catch (NumberFormatException e) {
                    // Ignore invalid target values
                }
            }
            
            String targetUnit = (String) goalRequest.get("targetUnit");
            if (targetUnit != null && !targetUnit.trim().isEmpty()) {
                goal.setTargetUnit(targetUnit.trim());
            }
            
            Object isPublicObj = goalRequest.get("isPublic");
            if (isPublicObj != null) {
                goal.setPublic(Boolean.parseBoolean(isPublicObj.toString()));
            } else {
                goal.setPublic(true); // default
            }
            
            Object maxBuddiesObj = goalRequest.get("maxBuddies");
            if (maxBuddiesObj != null) {
                try {
                    if (maxBuddiesObj instanceof String) {
                        goal.setMaxBuddies(Integer.parseInt((String) maxBuddiesObj));
                    } else if (maxBuddiesObj instanceof Number) {
                        goal.setMaxBuddies(((Number) maxBuddiesObj).intValue());
            }
                } catch (NumberFormatException e) {
                    goal.setMaxBuddies(3); // default
                }
            } else {
                goal.setMaxBuddies(3); // default
            }
            
            // Initialize progress
            goal.setCurrentProgress(0);
            goal.setStatus(Goal.GoalStatus.ACTIVE);
            
            Goal savedGoal = goalRepository.save(goal);
            
            // Create response with calculated fields
            Map<String, Object> response = createGoalResponse(savedGoal);
            response.put("message", "Goal created successfully!");
            response.put("goalId", savedGoal.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Goal creation service temporarily unavailable: " + e.getMessage()));
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
            
            List<Goal> goals = goalRepository.findByUserOrderByCreatedAtDesc(user);
            
            // Add calculated fields to each goal
            List<Map<String, Object>> goalsWithData = goals.stream()
                    .map(this::createGoalResponse)
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "goals", goalsWithData,
                    "totalGoals", goals.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to retrieve goals: " + e.getMessage()));
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
            
            // Check if user owns this goal or if it's public
            if (!goal.getUser().getId().equals(user.getId()) && !goal.isPublic()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You don't have permission to access this goal"));
            }
            
            return ResponseEntity.ok(createGoalResponse(goal));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to retrieve goal: " + e.getMessage()));
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
            
            // Update category if provided
            String categoryStr = (String) goalRequest.get("category");
            if (categoryStr != null) {
                try {
                    goal.setCategory(Goal.GoalCategory.valueOf(categoryStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid category"));
                }
            }
            
            // Update difficulty if provided
            String difficultyStr = (String) goalRequest.get("difficulty");
            if (difficultyStr != null) {
                try {
                    goal.setDifficulty(Goal.DifficultyLevel.valueOf(difficultyStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid difficulty
                }
            }
            
            // Update progress if provided
            Object currentProgressObj = goalRequest.get("currentProgress");
            if (currentProgressObj != null) {
                try {
                    int progress;
                    if (currentProgressObj instanceof String) {
                        progress = Integer.parseInt((String) currentProgressObj);
                    } else if (currentProgressObj instanceof Number) {
                        progress = ((Number) currentProgressObj).intValue();
                    } else {
                        progress = goal.getCurrentProgress(); // keep current
                    }
                    
                    goal.setCurrentProgress(Math.max(0, Math.min(100, progress)));
                    
                    // Auto-complete if 100%
                    if (progress >= 100 && goal.getStatus() == Goal.GoalStatus.ACTIVE) {
                        goal.setStatus(Goal.GoalStatus.COMPLETED);
                        goal.setCompletedAt(LocalDateTime.now());
                    }
                } catch (NumberFormatException e) {
                    // Ignore invalid progress
                }
            }
            
            // Update other fields
            Object isPublicObj = goalRequest.get("isPublic");
            if (isPublicObj != null) {
                goal.setPublic(Boolean.parseBoolean(isPublicObj.toString()));
            }
            
            Object maxBuddiesObj = goalRequest.get("maxBuddies");
            if (maxBuddiesObj != null) {
                try {
                    if (maxBuddiesObj instanceof String) {
                        goal.setMaxBuddies(Integer.parseInt((String) maxBuddiesObj));
                    } else if (maxBuddiesObj instanceof Number) {
                        goal.setMaxBuddies(((Number) maxBuddiesObj).intValue());
                    }
                } catch (NumberFormatException e) {
                    // Ignore invalid max buddies
                }
            }
            
            Goal savedGoal = goalRepository.save(goal);
            
            Map<String, Object> response = createGoalResponse(savedGoal);
            response.put("message", "Goal updated successfully!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Goal update service temporarily unavailable: " + e.getMessage()));
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
                    .body(Map.of("error", "Goal deletion service temporarily unavailable: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{goalId}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable Long goalId,
                                          @RequestBody Map<String, Object> progressData,
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
            
            Object progressObj = progressData.get("progress");
            if (progressObj == null) {
                progressObj = progressData.get("currentProgress");
            }
            
            if (progressObj != null) {
                int newProgress;
                if (progressObj instanceof String) {
                    newProgress = Integer.parseInt((String) progressObj);
                } else if (progressObj instanceof Number) {
                    newProgress = ((Number) progressObj).intValue();
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid progress value"));
            }
            
                // Validate progress range
                newProgress = Math.max(0, Math.min(100, newProgress));
                goal.setCurrentProgress(newProgress);
                
                // Auto-complete if 100%
                if (newProgress >= 100 && goal.getStatus() == Goal.GoalStatus.ACTIVE) {
                    goal.setStatus(Goal.GoalStatus.COMPLETED);
                    goal.setCompletedAt(LocalDateTime.now());
                }
                
                Goal updatedGoal = goalRepository.save(goal);
                
                Map<String, Object> response = createGoalResponse(updatedGoal);
                response.put("message", "Progress updated successfully!");
                response.put("isCompleted", updatedGoal.getStatus() == Goal.GoalStatus.COMPLETED);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Progress value is required"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update progress: " + e.getMessage()));
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<?> getGoalCategories() {
        try {
            Goal.GoalCategory[] categories = Goal.GoalCategory.values();
            Goal.GoalType[] types = Goal.GoalType.values();
            Goal.DifficultyLevel[] difficulties = Goal.DifficultyLevel.values();
            Goal.GoalStatus[] statuses = Goal.GoalStatus.values();
            
            return ResponseEntity.ok(Map.of(
                    "categories", categories,
                    "types", types,
                    "difficulties", difficulties,
                    "statuses", statuses
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
            
            List<Map<String, Object>> goalsWithData = activeGoals.stream()
                    .map(this::createGoalResponse)
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "activeGoals", goalsWithData,
                    "totalActive", goalsWithData.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get active goals: " + e.getMessage()));
        }
    }
    
    // Helper method to create consistent goal response with calculated fields
    private Map<String, Object> createGoalResponse(Goal goal) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", goal.getId());
        response.put("title", goal.getTitle());
        response.put("description", goal.getDescription());
        response.put("category", goal.getCategory());
        response.put("type", goal.getType());
        response.put("difficulty", goal.getDifficulty());
        response.put("status", goal.getStatus());
        response.put("startDate", goal.getStartDate().toString());
        response.put("targetDate", goal.getTargetDate().toString());
        response.put("targetValue", goal.getTargetValue());
        response.put("targetUnit", goal.getTargetUnit());
        response.put("currentProgress", goal.getCurrentProgress());
        response.put("isPublic", goal.isPublic());
        response.put("maxBuddies", goal.getMaxBuddies());
        response.put("createdAt", goal.getCreatedAt());
        response.put("updatedAt", goal.getUpdatedAt());
        response.put("completedAt", goal.getCompletedAt());
        
        // Calculated fields
        response.put("progressPercentage", goal.getProgressPercentage());
        response.put("daysRemaining", goal.getDaysRemaining());
        response.put("totalDays", goal.getTotalDays());
        response.put("isOverdue", goal.isOverdue());
        
        return response;
    }
} 