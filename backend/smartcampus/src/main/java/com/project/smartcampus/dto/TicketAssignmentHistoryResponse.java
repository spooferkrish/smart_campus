package com.project.smartcampus.dto;

import java.time.LocalDateTime;

public class TicketAssignmentHistoryResponse {

    private Long id;
    private Long ticketId;
    private Long assignedBy;
    private String assignedByName;
    private Long fromTechnicianId;
    private String fromTechnicianName;
    private Long toTechnicianId;
    private String toTechnicianName;
    private String reason;
    private LocalDateTime assignedAt;

    public TicketAssignmentHistoryResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(Long assignedBy) {
        this.assignedBy = assignedBy;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }

    public Long getFromTechnicianId() {
        return fromTechnicianId;
    }

    public void setFromTechnicianId(Long fromTechnicianId) {
        this.fromTechnicianId = fromTechnicianId;
    }

    public String getFromTechnicianName() {
        return fromTechnicianName;
    }

    public void setFromTechnicianName(String fromTechnicianName) {
        this.fromTechnicianName = fromTechnicianName;
    }

    public Long getToTechnicianId() {
        return toTechnicianId;
    }

    public void setToTechnicianId(Long toTechnicianId) {
        this.toTechnicianId = toTechnicianId;
    }

    public String getToTechnicianName() {
        return toTechnicianName;
    }

    public void setToTechnicianName(String toTechnicianName) {
        this.toTechnicianName = toTechnicianName;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
