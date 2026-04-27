package com.project.smartcampus.dto;

import com.project.smartcampus.enums.TicketStatus;

public class UpdateTicketStatusRequest {

    private TicketStatus status;

    public UpdateTicketStatusRequest() {
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}