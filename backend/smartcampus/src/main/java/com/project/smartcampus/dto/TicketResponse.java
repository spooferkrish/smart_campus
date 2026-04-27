package com.project.smartcampus.dto;

import com.project.smartcampus.enums.TicketCategory;
import com.project.smartcampus.enums.TicketPriority;
import com.project.smartcampus.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private List<String> images;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private Long createdBy;
    private String createdByName;
    private Long assignedTo;
    private String assignedToName;
    private LocalDateTime firstResponseAt;
    private Long timeToFirstResponseMinutes;
    private Long timeToResolutionMinutes;
    private Boolean firstResponseSlaBreached;
    private Boolean resolutionSlaBreached;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public TicketResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public List<String> getImages() { return images; }

    public void setImages(List<String> images) { this.images = images; }

    public TicketCategory getCategory() { return category; }

    public void setCategory(TicketCategory category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }

    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }

    public void setStatus(TicketStatus status) { this.status = status; }

    public Long getCreatedBy() { return createdBy; }

    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getCreatedByName() { return createdByName; }

    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public Long getAssignedTo() { return assignedTo; }

    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedToName() { return assignedToName; }

    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public LocalDateTime getFirstResponseAt() { return firstResponseAt; }

    public void setFirstResponseAt(LocalDateTime firstResponseAt) { this.firstResponseAt = firstResponseAt; }

    public Long getTimeToFirstResponseMinutes() { return timeToFirstResponseMinutes; }

    public void setTimeToFirstResponseMinutes(Long timeToFirstResponseMinutes) {
        this.timeToFirstResponseMinutes = timeToFirstResponseMinutes;
    }

    public Long getTimeToResolutionMinutes() { return timeToResolutionMinutes; }

    public void setTimeToResolutionMinutes(Long timeToResolutionMinutes) {
        this.timeToResolutionMinutes = timeToResolutionMinutes;
    }

    public Boolean getFirstResponseSlaBreached() { return firstResponseSlaBreached; }

    public void setFirstResponseSlaBreached(Boolean firstResponseSlaBreached) {
        this.firstResponseSlaBreached = firstResponseSlaBreached;
    }

    public Boolean getResolutionSlaBreached() { return resolutionSlaBreached; }

    public void setResolutionSlaBreached(Boolean resolutionSlaBreached) {
        this.resolutionSlaBreached = resolutionSlaBreached;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }

    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}