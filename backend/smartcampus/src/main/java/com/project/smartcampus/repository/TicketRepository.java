package com.project.smartcampus.repository;

import com.project.smartcampus.entity.Ticket;
import com.project.smartcampus.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedBy(Long createdBy);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAssignedTo(Long assignedTo);
}