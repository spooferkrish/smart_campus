package com.project.smartcampus.services;

import com.project.smartcampus.dto.NotificationDTO;
import com.project.smartcampus.exception.ResourceNotFoundException;
import com.project.smartcampus.exception.UnauthorizedException;
import com.project.smartcampus.entity.Notification;
import com.project.smartcampus.enums.NotificationType;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.repository.NotificationRepository;
import com.project.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing notifications.
 * Provides methods for creating, reading, marking, and deleting notifications.
 * Also exposes convenience methods for other modules to send typed notifications.
 */
@Slf4j
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates and saves a new notification for a user.
     *
     * @param recipientId   ID of the user to notify
     * @param type          type of notification
     * @param title         short notification title
     * @param message       full notification message (max 500 chars)
     * @param referenceId   ID of the related booking/ticket (nullable)
     * @param referenceType "BOOKING" or "TICKET" (nullable)
     * @return the created notification as a DTO
     */
    public NotificationDTO createNotification(Long recipientId, NotificationType type,
                                              String title, String message,
                                              Long referenceId, String referenceType) {
        User recipient = userRepository.findById(recipientId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + recipientId));

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", recipientId, type);
        return NotificationDTO.fromNotification(saved);
    }

    /**
     * Retrieves all notifications for a user, ordered by newest first.
     *
     * @param userId the user's ID
     * @return list of notification DTOs
     */
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::fromNotification)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves only unread notifications for a user.
     *
     * @param userId the user's ID
     * @return list of unread notification DTOs
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::fromNotification)
                .collect(Collectors.toList());
    }

    /**
     * Returns the count of unread notifications for a user.
     *
     * @param userId the user's ID
     * @return unread count
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    /**
     * Marks a single notification as read. Verifies the notification belongs to the requesting user.
     *
     * @param notificationId ID of the notification to mark as read
     * @param userId         ID of the requesting user
     * @return updated notification DTO
     */
    @Transactional
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this notification");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return NotificationDTO.fromNotification(updated);
    }

    /**
     * Marks all notifications for a user as read.
     *
     * @param userId the user's ID
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("Marked all notifications as read for user {}", userId);
    }

    /**
     * Deletes a single notification. Verifies the notification belongs to the requesting user.
     *
     * @param notificationId ID of the notification to delete
     * @param userId         ID of the requesting user
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this notification");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    /**
     * Deletes all notifications for a user.
     *
     * @param userId the user's ID
     */
    @Transactional
    public void clearAllNotifications(Long userId) {
        notificationRepository.deleteByRecipientId(userId);
        log.info("Cleared all notifications for user {}", userId);
    }

    // ─── Convenience methods for other modules ──────────────────────────────

    /**
     * Notifies a user that their booking was approved.
     *
     * @param userId       ID of the user who made the booking
     * @param bookingId    ID of the approved booking
     * @param resourceName name of the booked resource
     */
    public void notifyBookingApproved(Long userId, Long bookingId, String resourceName) {
        createNotification(
                userId,
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for \"" + resourceName + "\" has been approved.",
                bookingId,
                "BOOKING"
        );
    }

    /**
     * Notifies a user that their booking was rejected.
     *
     * @param userId       ID of the user who made the booking
     * @param bookingId    ID of the rejected booking
     * @param resourceName name of the resource
     * @param reason       reason for rejection
     */
    public void notifyBookingRejected(Long userId, Long bookingId, String resourceName, String reason) {
        createNotification(
                userId,
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for \"" + resourceName + "\" was rejected. Reason: " + reason,
                bookingId,
                "BOOKING"
        );
    }

    /**
     * Notifies a user that their ticket's status has changed.
     *
     * @param userId    ID of the ticket creator
     * @param ticketId  ID of the ticket
     * @param newStatus new status string
     */
    public void notifyTicketStatusChanged(Long userId, Long ticketId, String newStatus) {
        createNotification(
                userId,
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated",
                "Your ticket status has been changed to: " + newStatus,
                ticketId,
                "TICKET"
        );
    }

    /**
     * Notifies a technician that a ticket has been assigned to them.
     *
     * @param technicianId ID of the technician
     * @param ticketId     ID of the assigned ticket
     * @param ticketTitle  title of the ticket
     */
    public void notifyTicketAssigned(Long technicianId, Long ticketId, String ticketTitle) {
        createNotification(
                technicianId,
                NotificationType.TICKET_ASSIGNED,
                "New Ticket Assigned",
                "You have been assigned to ticket: \"" + ticketTitle + "\"",
                ticketId,
                "TICKET"
        );
    }

    /**
     * Notifies a user that a new comment was added to their ticket.
     *
     * @param userId        ID of the ticket owner
     * @param ticketId      ID of the ticket
     * @param commenterName name of the person who commented
     */
    public void notifyNewComment(Long userId, Long ticketId, String commenterName) {
        createNotification(
                userId,
                NotificationType.NEW_COMMENT,
                "New Comment on Your Ticket",
                commenterName + " added a comment to your ticket.",
                ticketId,
                "TICKET"
        );
    }
}
