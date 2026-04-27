package com.project.smartcampus.services;

import com.project.smartcampus.config.JwtUtil;
import com.project.smartcampus.dto.AuthResponse;
import com.project.smartcampus.dto.LoginRequest;
import com.project.smartcampus.dto.SignupRequest;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.exception.UnauthorizedException;
import com.project.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User existingTechnician;

    @BeforeEach
    void setUp() {
        existingTechnician = User.builder()
                .id(11L)
                .email("tech@example.com")
                .name("Tech User")
                .passwordHash("encoded-password")
                .role(Role.TECHNICIAN)
                .provider("LOCAL")
                .notificationsEnabled(true)
                .build();
    }

    @Test
    void signup_shouldPersistRequestedRole() {
        SignupRequest request = new SignupRequest(
                "Tech User",
                "tech@example.com",
                "StrongPass@1",
                Role.TECHNICIAN
        );

        when(userRepository.existsByEmail("tech@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass@1")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(15L);
            return saved;
        });
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.signup(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User persisted = userCaptor.getValue();

        assertThat(persisted.getRole()).isEqualTo(Role.TECHNICIAN);
        assertThat(response.getUser().getRole()).isEqualTo(Role.TECHNICIAN);
        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    @Test
    void signup_shouldAllowAdminRoleFromPublicSignup() {
        SignupRequest request = new SignupRequest(
                "Admin User",
                "admin@example.com",
                "StrongPass@1",
                Role.ADMIN
        );

        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass@1")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(21L);
            return saved;
        });
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.signup(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User persisted = userCaptor.getValue();

        assertThat(persisted.getRole()).isEqualTo(Role.ADMIN);
        assertThat(response.getUser().getRole()).isEqualTo(Role.ADMIN);
        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    @Test
    void login_shouldRejectWhenSelectedRoleDoesNotMatchPersistedRole() {
        LoginRequest request = new LoginRequest(
                "tech@example.com",
                "StrongPass@1",
                Role.USER
        );

        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(existingTechnician));
        when(passwordEncoder.matches("StrongPass@1", "encoded-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Selected role does not match");
    }

    @Test
    void login_shouldSucceedWhenSelectedRoleMatchesPersistedRole() {
        LoginRequest request = new LoginRequest(
                "tech@example.com",
                "StrongPass@1",
                Role.TECHNICIAN
        );

        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(existingTechnician));
        when(passwordEncoder.matches("StrongPass@1", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(eq(existingTechnician))).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getRole()).isEqualTo(Role.TECHNICIAN);
    }
}
