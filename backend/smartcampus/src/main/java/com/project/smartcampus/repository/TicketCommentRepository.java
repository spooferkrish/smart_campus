package com.project.smartcampus.repository;

import com.project.smartcampus.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAscIdAsc(Long ticketId);

    List<TicketComment> findByTicketIdInOrderByCreatedAtAscIdAsc(List<Long> ticketIds);
}