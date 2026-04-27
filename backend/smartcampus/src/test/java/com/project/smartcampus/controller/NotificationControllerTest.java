package com.project.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.smartcampus.dto.NotificationDTO;
import com.project.smartcampus.enums.NotificationType;
import com.project.smartcampus.services.NotificationService;
import com.project.smartcampus.services.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private NotificationService notificationService;

    @MockitoBean
    private UserService userService;

    private NotificationDTO sampleNotification() {
        return NotificationDTO.builder()
                .id(1L)
                .recipientId(10L)
                .type(NotificationType.BOOKING_APPROVED)
                .title("Booking Approved")
                .message("Your booking has been approved.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getNotifications_shouldReturn200WithList() throws Exception {
        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);
        when(notificationService.getNotificationsForUser(10L)).thenReturn(List.of(sampleNotification()));

        mockMvc.perform(get("/api/notifications").with(user("10").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Booking Approved"))
                .andExpect(jsonPath("$[0].read").value(false));
    }

    @Test
    void getUnreadNotifications_shouldReturn200() throws Exception {
        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);
        when(notificationService.getUnreadNotifications(10L)).thenReturn(List.of(sampleNotification()));

        mockMvc.perform(get("/api/notifications/unread").with(user("10").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUnreadCount_shouldReturn200WithCount() throws Exception {
        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);
        when(notificationService.getUnreadCount(10L)).thenReturn(3L);

        mockMvc.perform(get("/api/notifications/unread/count").with(user("10").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));
    }

    @Test
    void markAsRead_shouldReturn200() throws Exception {
        NotificationDTO read = sampleNotification();
        read.setRead(true);

        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);
        when(notificationService.markAsRead(1L, 10L)).thenReturn(read);

        mockMvc.perform(patch("/api/notifications/1/read")
                        .with(user("10").roles("USER")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    void markAllAsRead_shouldReturn200() throws Exception {
        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);

        mockMvc.perform(patch("/api/notifications/read-all")
                        .with(user("10").roles("USER")).with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void deleteNotification_shouldReturn204() throws Exception {
        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);

        mockMvc.perform(delete("/api/notifications/1")
                        .with(user("10").roles("USER")).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void clearAllNotifications_shouldReturn204() throws Exception {
        when(userService.extractUserId(ArgumentMatchers.any())).thenReturn(10L);

        mockMvc.perform(delete("/api/notifications/clear")
                        .with(user("10").roles("USER")).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getNotifications_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized());
    }
}
