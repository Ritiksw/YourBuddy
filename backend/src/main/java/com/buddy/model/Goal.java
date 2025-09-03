package com.buddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "goals")
public class Goal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 200)
    private String title;
    
    @Size(max = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @NotNull
    private GoalCategory category;
    
    @Enumerated(EnumType.STRING)
    @NotNull
    private GoalType type;
    
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    private GoalStatus status = GoalStatus.ACTIVE;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate targetDate;
    
    private Integer targetValue; // For quantifiable goals (e.g., 30 workouts)
    private String targetUnit; // "workouts", "pages", "minutes", etc.
    
    private Integer currentProgress = 0;
    
    @Column(name = "is_public")
    private boolean isPublic = true; // Can others see and join this goal?
    
    @Column(name = "max_buddies")
    private Integer maxBuddies = 1; // How many buddies can join
    
    @Column(name = "requires_location")
    private boolean requiresLocation = false; // For location-based goals
    
    private String location; // City or specific location
    private Double latitude;
    private Double longitude;
    
    @ElementCollection
    @CollectionTable(name = "goal_tags", joinColumns = @JoinColumn(name = "goal_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    // Enums
    public enum GoalCategory {
        FITNESS, EDUCATION, HOBBY, CAREER, HEALTH, SOCIAL, CREATIVE, SPIRITUAL, OTHER
    }
    
    public enum GoalType {
        HABIT, PROJECT, CHALLENGE, LEARNING, EVENT
    }
    
    public enum DifficultyLevel {
        EASY, MEDIUM, HARD, EXPERT
    }
    
    public enum GoalStatus {
        ACTIVE, COMPLETED, PAUSED, CANCELLED
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
    public Goal() {}
    
    public Goal(String title, String description, GoalCategory category, GoalType type, 
                User user, LocalDate startDate, LocalDate targetDate) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.type = type;
        this.user = user;
        this.startDate = startDate;
        this.targetDate = targetDate;
    }
    
    // Business logic methods
    public double getProgressPercentage() {
        if (targetValue == null || targetValue == 0) {
            return 0.0;
        }
        return Math.min(100.0, (currentProgress.doubleValue() / targetValue.doubleValue()) * 100.0);
    }
    
    public int getDaysRemaining() {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), targetDate);
    }
    
    public int getTotalDays() {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, targetDate);
    }
    
    public boolean isOverdue() {
        return LocalDate.now().isAfter(targetDate) && status == GoalStatus.ACTIVE;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public GoalCategory getCategory() { return category; }
    public void setCategory(GoalCategory category) { this.category = category; }
    
    public GoalType getType() { return type; }
    public void setType(GoalType type) { this.type = type; }
    
    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }
    
    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    
    public Integer getTargetValue() { return targetValue; }
    public void setTargetValue(Integer targetValue) { this.targetValue = targetValue; }
    
    public String getTargetUnit() { return targetUnit; }
    public void setTargetUnit(String targetUnit) { this.targetUnit = targetUnit; }
    
    public Integer getCurrentProgress() { return currentProgress; }
    public void setCurrentProgress(Integer currentProgress) { this.currentProgress = currentProgress; }
    
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean aPublic) { isPublic = aPublic; }
    
    public Integer getMaxBuddies() { return maxBuddies; }
    public void setMaxBuddies(Integer maxBuddies) { this.maxBuddies = maxBuddies; }
    
    public boolean isRequiresLocation() { return requiresLocation; }
    public void setRequiresLocation(boolean requiresLocation) { this.requiresLocation = requiresLocation; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
} 