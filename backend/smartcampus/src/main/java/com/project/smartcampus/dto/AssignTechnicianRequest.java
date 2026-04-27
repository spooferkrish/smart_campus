package com.project.smartcampus.dto;

public class AssignTechnicianRequest {

    private Long assignedTo;
    private String reason;

    public AssignTechnicianRequest() {
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}