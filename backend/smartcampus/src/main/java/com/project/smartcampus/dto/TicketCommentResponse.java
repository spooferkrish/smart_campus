package com.project.smartcampus.dto;

import java.time.LocalDateTime;

public class TicketCommentResponse {

    private Long id;
    private String comment;
    private Long commentedBy;
    private String commentedByName;
    private String commentedByRole;
    private Long parentCommentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean edited;

    public TicketCommentResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getCommentedBy() {
        return commentedBy;
    }

    public void setCommentedBy(Long commentedBy) {
        this.commentedBy = commentedBy;
    }

    public String getCommentedByName() {
        return commentedByName;
    }

    public void setCommentedByName(String commentedByName) {
        this.commentedByName = commentedByName;
    }

    public String getCommentedByRole() {
        return commentedByRole;
    }

    public void setCommentedByRole(String commentedByRole) {
        this.commentedByRole = commentedByRole;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isEdited() {
        return edited;
    }

    public void setEdited(boolean edited) {
        this.edited = edited;
    }
}