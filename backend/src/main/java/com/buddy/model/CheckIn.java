package com.buddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "check_ins")
public class CheckIn {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @Column(name = "check_in_date")
    private LocalDate checkInDate;
    
    @Column(name = "progress_value")
    private Integer progressValue; // How much progress made today
    
    @Column(length = 1000)
    private String notes; // User's reflection on the day
    
    @Column(length = 2000)
    private String reflection; // Longer reflection or learnings
    
    @Min(1) @Max(10)
    @Column(name = "motivation_level")
    private Integer motivationLevel; // 1-10 scale
    
    @Min(1) @Max(10)
    @Column(name = "difficulty_level")
    private Integer difficultyLevel; // How hard was it today? 1-10
    
    @Column(name = "completed")
    private boolean completed = false; // Did they complete their daily target?
    
    @ElementCollection
    @CollectionTable(name = "check_in_photos", joinColumns = @JoinColumn(name = "check_in_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls; // Proof photos
    
    @ElementCollection
    @CollectionTable(name = "check_in_tags", joinColumns = @JoinColumn(name = "check_in_id"))
    @Column(name = "tag")
    private List<String> tags; // Custom tags for the day
    
    @Column(name = "buddy_validated")
    private boolean buddyValidated = false; // Has buddy confirmed this check-in?
    
    @Column(name = "buddy_validation_date")
    private LocalDateTime buddyValidationDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by_user_id")
    private User validatedBy; // Which buddy validated this
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (checkInDate == null) {
            checkInDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public CheckIn() {}
    
    public CheckIn(Goal goal, User user, Integer progressValue, String notes) {
        this.goal = goal;
        this.user = user;
        this.progressValue = progressValue;
        this.notes = notes;
        this.checkInDate = LocalDate.now();
    }
    
    // Business logic methods
    public boolean isToday() {
        return checkInDate.equals(LocalDate.now());
    }
    
    public boolean isRecent() {
        return checkInDate.isAfter(LocalDate.now().minusDays(7));
    }
    
    public void validateByBuddy(User buddy) {
        this.buddyValidated = true;
        this.validatedBy = buddy;
        this.buddyValidationDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    
    public Integer getProgressValue() { return progressValue; }
    public void setProgressValue(Integer progressValue) { this.progressValue = progressValue; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getReflection() { return reflection; }
    public void setReflection(String reflection) { this.reflection = reflection; }
    
    public Integer getMotivationLevel() { return motivationLevel; }
    public void setMotivationLevel(Integer motivationLevel) { this.motivationLevel = motivationLevel; }
    
    public Integer getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(Integer difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public boolean isBuddyValidated() { return buddyValidated; }
    public void setBuddyValidated(boolean buddyValidated) { this.buddyValidated = buddyValidated; }
    
    public LocalDateTime getBuddyValidationDate() { return buddyValidationDate; }
    public void setBuddyValidationDate(LocalDateTime buddyValidationDate) { this.buddyValidationDate = buddyValidationDate; }
    
    public User getValidatedBy() { return validatedBy; }
    public void setValidatedBy(User validatedBy) { this.validatedBy = validatedBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 