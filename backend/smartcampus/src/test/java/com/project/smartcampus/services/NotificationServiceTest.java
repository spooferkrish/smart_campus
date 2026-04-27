package com.project.smartcampus.services;

import com.project.smartcampus.dto.NotificationDTO;
import com.project.smartcampus.exception.ResourceNotFoundException;
import com.project.smartcampus.exception.UnauthorizedException;
import com.project.smartcampus.entity.Notification;
import com.project.smartcampus.enums.NotificationType;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.repository.NotificationRepository;
import com.project.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .role(Role.USER)
                .build();

        testNotification = Notification.builder()
                .id(10L)
                .recipient(testUser)
                .type(NotificationType.BOOKING_APPROVED)
                .title("Booking Approved")
                .message("Your booking has been approved.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createNotification_shouldSaveAndReturnDTO() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        NotificationDTO result = notificationService.createNotification(
                1L, NotificationType.BOOKING_APPROVED,
                "Booking Approved", "Your booking has been approved.",
                100L, "BOOKING"
        );

        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(NotificationType.BOOKING_APPROVED);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void createNotification_shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.createNotification(
                99L, NotificationType.BOOKING_APPROVED, "Title", "Message", null, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getNotificationsForUser_shouldReturnList() {
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(testNotification));

        List<NotificationDTO> result = notificationService.getNotificationsForUser(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Booking Approved");
    }

    @Test
    void getUnreadCount_shouldReturnCount() {
        when(notificationRepository.countByRecipientIdAndIsReadFalse(1L)).thenReturn(3L);

        long count = notificationService.getUnreadCount(1L);

        assertThat(count).isEqualTo(3L);
    }

    @Test
    void markAsRead_shouldUpdateIsRead() {
        testNotification.setRead(false);
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationDTO result = notificationService.markAsRead(10L, 1L);

        assertThat(result.isRead()).isTrue();
    }

    @Test
    void markAsRead_shouldThrowWhenNotificationBelongsToDifferentUser() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(testNotification));

        assertThatThrownBy(() -> notificationService.markAsRead(10L, 999L))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void markAsRead_shouldThrowWhenNotificationNotFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(999L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteNotification_shouldDelete() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(testNotification));

        notificationService.deleteNotification(10L, 1L);

        verify(notificationRepository, times(1)).delete(testNotification);
    }

    @Test
    void deleteNotification_shouldThrowWhenUnauthorized() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(testNotification));

        assertThatThrownBy(() -> notificationService.deleteNotification(10L, 999L))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void notifyBookingApproved_shouldCreateCorrectNotification() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.notifyBookingApproved(1L, 5L, "Conference Room A");

        verify(notificationRepository).save(argThat(n ->
                n.getType() == NotificationType.BOOKING_APPROVED &&
                n.getMessage().contains("Conference Room A")
        ));
    }

    @Test
    void notifyBookingRejected_shouldIncludeReason() {
        Notification rejected = Notification.builder()
                .id(11L).recipient(testUser)
                .type(NotificationType.BOOKING_REJECTED)
                .title("Booking Rejected").message("Rejected: already booked")
                .isRead(false).createdAt(LocalDateTime.now()).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(rejected);

        notificationService.notifyBookingRejected(1L, 5L, "Lab 1", "already booked");

        verify(notificationRepository).save(argThat(n ->
                n.getType() == NotificationType.BOOKING_REJECTED &&
                n.getMessage().contains("already booked")
        ));
    }
}
