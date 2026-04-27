package com.project.smartcampus.controller;

import com.project.smartcampus.dto.NotificationDTO;
import com.project.smartcampus.services.NotificationService;
import com.project.smartcampus.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for notification operations (authenticated users).
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService,
                                  UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    /**
     * Returns all notifications for the current user.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    /**
     * Returns unread notifications for the current user.
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * Returns the count of unread notifications for the current user.
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    /**
     * Marks all notifications for the current user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Deletes a single notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Clears all notifications for the current user.
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearAllNotifications(Authentication authentication) {
        Long userId = userService.extractUserId(authentication);
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.noContent().build();
    }
}
