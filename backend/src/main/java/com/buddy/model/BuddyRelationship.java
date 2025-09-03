package com.buddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "buddy_relationships")
public class BuddyRelationship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1; // Goal creator or first user
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2; // Buddy who joined
    
    @Enumerated(EnumType.STRING)
    @NotNull
    private RelationshipStatus status = RelationshipStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    private RelationshipType type = RelationshipType.PEER;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Compatibility and interaction metrics
    private Integer compatibilityScore; // 0-100
    private Integer interactionCount = 0;
    private LocalDateTime lastInteraction;
    
    @Column(length = 500)
    private String notes; // Personal notes about the buddy relationship
    
    // Enums
    public enum RelationshipStatus {
        PENDING,     // Waiting for acceptance
        ACTIVE,      // Currently working together
        COMPLETED,   // Goal achieved together
        PAUSED,      // Temporarily inactive
        ENDED        // Relationship ended (by choice or goal completion)
    }
    
    public enum RelationshipType {
        PEER,        // Equal level partnership
        MENTOR,      // One person guides the other
        MENTEE       // One person is being guided
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public BuddyRelationship() {}
    
    public BuddyRelationship(Goal goal, User user1, User user2) {
        this.goal = goal;
        this.user1 = user1;
        this.user2 = user2;
    }
    
    // Business logic methods
    public boolean isActive() {
        return status == RelationshipStatus.ACTIVE;
    }
    
    public User getOtherUser(User currentUser) {
        if (currentUser.getId().equals(user1.getId())) {
            return user2;
        } else if (currentUser.getId().equals(user2.getId())) {
            return user1;
        }
        return null;
    }
    
    public void recordInteraction() {
        this.interactionCount++;
        this.lastInteraction = LocalDateTime.now();
    }
    
    public int getDaysActive() {
        LocalDateTime start = startedAt != null ? startedAt : createdAt;
        LocalDateTime end = endedAt != null ? endedAt : LocalDateTime.now();
        return (int) java.time.temporal.ChronoUnit.DAYS.between(start, end);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }
    
    public User getUser1() { return user1; }
    public void setUser1(User user1) { this.user1 = user1; }
    
    public User getUser2() { return user2; }
    public void setUser2(User user2) { this.user2 = user2; }
    
    public RelationshipStatus getStatus() { return status; }
    public void setStatus(RelationshipStatus status) { this.status = status; }
    
    public RelationshipType getType() { return type; }
    public void setType(RelationshipType type) { this.type = type; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getCompatibilityScore() { return compatibilityScore; }
    public void setCompatibilityScore(Integer compatibilityScore) { this.compatibilityScore = compatibilityScore; }
    
    public Integer getInteractionCount() { return interactionCount; }
    public void setInteractionCount(Integer interactionCount) { this.interactionCount = interactionCount; }
    
    public LocalDateTime getLastInteraction() { return lastInteraction; }
    public void setLastInteraction(LocalDateTime lastInteraction) { this.lastInteraction = lastInteraction; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
} 