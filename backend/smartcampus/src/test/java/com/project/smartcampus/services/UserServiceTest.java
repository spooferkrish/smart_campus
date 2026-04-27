package com.project.smartcampus.services;

import com.project.smartcampus.dto.RoleUpdateRequest;
import com.project.smartcampus.dto.UserDTO;
import com.project.smartcampus.exception.ResourceNotFoundException;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.entity.User;
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
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .name("Test User")
                .role(Role.USER)
                .provider("google")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getUserById_shouldReturnUserDTO() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDTO result = userService.getUserById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("user@example.com");
        assertThat(result.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void getUserById_shouldThrowWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllUsers_shouldReturnAllUsers() {
        User admin = User.builder().id(2L).email("admin@example.com").name("Admin").role(Role.ADMIN).build();
        when(userRepository.findAll()).thenReturn(List.of(testUser, admin));

        List<UserDTO> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserDTO::getEmail)
                .containsExactlyInAnyOrder("user@example.com", "admin@example.com");
    }

    @Test
    void updateUserRole_shouldChangeRoleAndNotify() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        RoleUpdateRequest request = new RoleUpdateRequest(Role.TECHNICIAN);
        UserDTO result = userService.updateUserRole(1L, request);

        assertThat(result.getRole()).isEqualTo(Role.TECHNICIAN);
        verify(notificationService, times(1)).createNotification(
                eq(1L), any(), anyString(), anyString(), isNull(), isNull());
    }

    @Test
    void updateUserRole_shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUserRole(99L, new RoleUpdateRequest(Role.ADMIN)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getUsersByRole_shouldFilterByRole() {
        User tech = User.builder().id(3L).email("tech@example.com").name("Tech").role(Role.TECHNICIAN).build();
        when(userRepository.findByRole(Role.TECHNICIAN)).thenReturn(List.of(tech));

        List<UserDTO> result = userService.getUsersByRole(Role.TECHNICIAN);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo(Role.TECHNICIAN);
    }

    @Test
    void deleteUser_shouldDeleteExistingUser() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteUser_shouldThrowWhenUserNotFound() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
