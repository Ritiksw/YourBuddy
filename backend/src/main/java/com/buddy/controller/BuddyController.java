package com.buddy.controller;

import com.buddy.model.BuddyRelationship;
import com.buddy.model.Goal;
import com.buddy.model.User;
import com.buddy.repository.BuddyRelationshipRepository;
import com.buddy.repository.UserRepository;
import com.buddy.service.BuddyMatchingService;
import com.buddy.service.FirebaseMessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/buddies")
@CrossOrigin(origins = "*")
public class BuddyController {
    
    @Autowired
    private BuddyMatchingService buddyMatchingService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BuddyRelationshipRepository buddyRelationshipRepository;
    
    @Autowired
    private FirebaseMessagingService firebaseMessagingService;
    
    @PostMapping("/request/{goalId}")
    public ResponseEntity<?> requestBuddy(@PathVariable Long goalId, 
                                        Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User requester = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            BuddyRelationship relationship = buddyMatchingService.requestBuddyship(requester, goalId);
            
            // Send notification to goal owner
            String notificationTitle = "New Buddy Request!";
            String notificationBody = String.format("%s wants to be your accountability buddy!", 
                    requester.getFirstName() != null ? requester.getFirstName() : requester.getUsername());
            
            // Note: You'd need to get the goal owner's FCM tokens and send notification
            
            return ResponseEntity.ok(Map.of(
                    "message", "Buddy request sent successfully!",
                    "relationshipId", relationship.getId(),
                    "status", relationship.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/accept/{relationshipId}")
    public ResponseEntity<?> acceptBuddyRequest(@PathVariable Long relationshipId,
                                              Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            BuddyRelationship relationship = buddyMatchingService.acceptBuddyRequest(user, relationshipId);
            
            // Send notification to requester
            String notificationTitle = "Buddy Request Accepted! 🎉";
            String notificationBody = String.format("%s accepted your buddy request! Time to start achieving goals together!", 
                    user.getFirstName() != null ? user.getFirstName() : user.getUsername());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Buddy request accepted!",
                    "relationship", relationship,
                    "buddy", relationship.getUser2()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/reject/{relationshipId}")
    public ResponseEntity<?> rejectBuddyRequest(@PathVariable Long relationshipId,
                                              Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            buddyMatchingService.rejectBuddyRequest(user, relationshipId);
            
            return ResponseEntity.ok(Map.of("message", "Buddy request rejected"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/my-buddies")
    public ResponseEntity<?> getMyBuddies(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<BuddyRelationship> relationships = buddyMatchingService.getUserBuddies(user);
            
            // Transform to include buddy info and goal details
            List<Map<String, Object>> buddiesData = relationships.stream()
                    .map(relationship -> {
                        User buddy = relationship.getOtherUser(user);
                        Map<String, Object> data = Map.of(
                                "relationshipId", relationship.getId(),
                                "buddy", Map.of(
                                        "id", buddy.getId(),
                                        "username", buddy.getUsername(),
                                        "firstName", buddy.getFirstName(),
                                        "lastName", buddy.getLastName()
                                ),
                                "goal", relationship.getGoal(),
                                "compatibilityScore", relationship.getCompatibilityScore(),
                                "daysActive", relationship.getDaysActive(),
                                "interactionCount", relationship.getInteractionCount()
                        );
                        return data;
                    })
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "buddies", buddiesData,
                    "totalBuddies", buddiesData.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get buddies: " + e.getMessage()));
        }
    }
    
    @GetMapping("/pending-requests")
    public ResponseEntity<?> getPendingRequests(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<BuddyRelationship> pendingRequests = buddyMatchingService.getPendingRequests(user);
            
            // Transform to include requester info
            List<Map<String, Object>> requestsData = pendingRequests.stream()
                    .map(relationship -> {
                        User requester = relationship.getUser2();
                        return Map.of(
                                "relationshipId", relationship.getId(),
                                "requester", Map.of(
                                        "id", requester.getId(),
                                        "username", requester.getUsername(),
                                        "firstName", requester.getFirstName(),
                                        "lastName", requester.getLastName()
                                ),
                                "goal", relationship.getGoal(),
                                "compatibilityScore", relationship.getCompatibilityScore(),
                                "requestDate", relationship.getCreatedAt()
                        );
                    })
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "pendingRequests", requestsData,
                    "totalRequests", requestsData.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get pending requests: " + e.getMessage()));
        }
    }
    
    @GetMapping("/recommendations")
    public ResponseEntity<?> getBuddyRecommendations(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Goal> compatibleGoals = buddyMatchingService.findCompatibleGoals(user);
            
            // Add compatibility scores and sort by score
            List<Map<String, Object>> recommendations = compatibleGoals.stream()
                    .map(goal -> {
                        int compatibilityScore = buddyMatchingService.calculateCompatibilityScore(user, goal);
                        return Map.of(
                                "goal", goal,
                                "goalOwner", Map.of(
                                        "id", goal.getUser().getId(),
                                        "username", goal.getUser().getUsername(),
                                        "firstName", goal.getUser().getFirstName(),
                                        "lastName", goal.getUser().getLastName()
                                ),
                                "compatibilityScore", compatibilityScore,
                                "daysRemaining", goal.getDaysRemaining(),
                                "progressPercentage", goal.getProgressPercentage()
                        );
                    })
                    .sorted((a, b) -> Integer.compare(
                            ((Integer) b.get("compatibilityScore")), 
                            ((Integer) a.get("compatibilityScore"))))
                    .limit(10) // Top 10 recommendations
                    .toList();
            
            return ResponseEntity.ok(Map.of(
                    "recommendations", recommendations,
                    "totalFound", recommendations.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get recommendations: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{relationshipId}/end")
    public ResponseEntity<?> endBuddyRelationship(@PathVariable Long relationshipId,
                                                 @RequestBody Map<String, String> reason,
                                                 Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            BuddyRelationship relationship = buddyRelationshipRepository.findById(relationshipId)
                    .orElseThrow(() -> new RuntimeException("Buddy relationship not found"));
            
            // Check if user is part of this relationship
            if (!relationship.getUser1().getId().equals(user.getId()) && 
                !relationship.getUser2().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You are not part of this buddy relationship"));
            }
            
            relationship.setStatus(BuddyRelationship.RelationshipStatus.ENDED);
            relationship.setEndedAt(java.time.LocalDateTime.now());
            if (reason.get("reason") != null) {
                relationship.setNotes(reason.get("reason"));
            }
            
            buddyRelationshipRepository.save(relationship);
            
            return ResponseEntity.ok(Map.of("message", "Buddy relationship ended"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to end relationship: " + e.getMessage()));
        }
    }
} 